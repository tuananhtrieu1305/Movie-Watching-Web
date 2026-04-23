import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../core/database/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.js";

const client = new OAuth2Client();

const normalizeEnvValue = (value = "") => value.trim().replace(/^"|"$/g, "");

const getGoogleClientIds = () => {
  const rawValue = process.env.GOOGLE_CLIENT_ID;

  return rawValue.split(",").map(normalizeEnvValue).filter(Boolean);
};

const _generateTokens = (user) => {
  const payload = { userId: user.id, role: user.role };

  // Calculate if user is premium
  const is_premium =
    user.vip_expires_at && new Date(user.vip_expires_at) > new Date();

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      is_premium: is_premium,
      vip_expires_at: user.vip_expires_at,
      provider: user.provider,
      created_at: user.created_at,
    },
  };
};

export const authService = {
  async registerLocal(email, password, username) {
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email)
        throw new Error("Email already registered");
      if (existingUser.username === username)
        throw new Error("Username already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        username,
        password: hashedPassword,
        provider: "local",
      },
    });

    return _generateTokens(newUser);
  },

  async loginLocal(email, password) {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password && user.provider === "google") {
      throw new Error("Please login with Google");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return _generateTokens(user);
  },

  async loginWithGoogle(credential) {
    const googleClientIds = getGoogleClientIds();
    if (!googleClientIds.length) {
      throw new Error("GOOGLE_CLIENT_ID is not configured on server");
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientIds,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: provider_id, picture: avatar_url } = payload;

    let user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      let baseUsername = email.split("@")[0];
      let username = baseUsername;
      let usernameTaken = await prisma.users.findUnique({
        where: { username },
      });
      let counter = 1;
      while (usernameTaken) {
        username = `${baseUsername}${counter}`;
        usernameTaken = await prisma.users.findUnique({ where: { username } });
        counter++;
      }

      user = await prisma.users.create({
        data: {
          email,
          username,
          provider: "google",
          provider_id,
          avatar_url,
          last_login: new Date(),
        },
      });
    } else {
      await prisma.users.update({
        where: { id: user.id },
        data: {
          last_login: new Date(),
          provider: user.provider === "local" ? "both" : "google",
          provider_id: provider_id,
        },
      });
    }

    return _generateTokens(user);
  },

  async updateProfile(userId, { username, password, avatar_url }) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const updateData = {};

    if (username) {
      const existingUser = await prisma.users.findFirst({
        where: { username, id: { not: userId } },
      });
      if (existingUser) {
        throw new Error("Username already taken");
      }
      updateData.username = username;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No fields to update");
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return _generateTokens(updatedUser);
  },

  async refreshToken(token) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      throw new Error("User no longer exists");
    }

    return _generateTokens(user);
  },
};
