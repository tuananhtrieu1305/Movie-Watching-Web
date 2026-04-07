import { authService } from "./auth.service.js";

const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const authController = {
    async register(req, res) {
        try {
            const { email, password, username } = req.body;
            if (!email || !password || !username) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const { accessToken, refreshToken, user } = await authService.registerLocal(email, password, username);

            res.cookie("refreshToken", refreshToken, cookieConfig);

            return res.status(201).json({ accessToken, user, message: "Registration successful" });
        } catch (error) {
            console.error("Register Error:", error);
            res.status(400).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const { accessToken, refreshToken, user } = await authService.loginLocal(email, password);

            res.cookie("refreshToken", refreshToken, cookieConfig);

            return res.status(200).json({ accessToken, user, message: "Login successful" });
        } catch (error) {
            console.error("Login Error:", error);
            res.status(401).json({ message: error.message });
        }
    },

    async googleAuth(req, res) {
        try {
            const { credential } = req.body;
            if (!credential) {
                return res.status(400).json({ message: "Google credential is required" });
            }

            const { accessToken, refreshToken, user } = await authService.loginWithGoogle(credential);

            res.cookie("refreshToken", refreshToken, cookieConfig);

            return res.status(200).json({ accessToken, user, message: "Google auth successful" });
        } catch (error) {
            console.error("Google Auth Error:", error);
            const message =
                process.env.NODE_ENV === "production"
                    ? "Invalid Google credential"
                    : error.message || "Invalid Google credential";

            res.status(401).json({ message });
        }
    },

    async refreshToken(req, res) {
        try {
            const token = req.cookies.refreshToken;
            if (!token) {
                return res.status(401).json({ message: "Refresh token not found" });
            }

            const { accessToken, refreshToken, user } = await authService.refreshToken(token);

            res.cookie("refreshToken", refreshToken, cookieConfig);

            return res.status(200).json({ accessToken, user });
        } catch (error) {
            console.error("Refresh Token Error:", error);
            res.status(401).json({ message: "Session expired or invalid. Please login again." });
        }
    },

    async logout(req, res) {
        res.clearCookie("refreshToken", cookieConfig);
        return res.status(200).json({ message: "Logged out successfully" });
    },

    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { username, password, avatar_url } = req.body;
            if (!username && !password && !avatar_url) {
                return res.status(400).json({ message: "At least one field (username, password or avatar_url) is required" });
            }

            const { accessToken, refreshToken, user } = await authService.updateProfile(userId, {
                username,
                password,
                avatar_url,
            });

            res.cookie("refreshToken", refreshToken, cookieConfig);

            return res.status(200).json({
                accessToken,
                user,
                message: "Profile updated successfully",
            });
        } catch (error) {
            console.error("Update Profile Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
};


