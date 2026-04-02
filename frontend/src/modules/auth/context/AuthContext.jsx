import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authApi";

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

export const AuthContext = createContext(null);

const getStoredUser = () => {
  const userRaw = localStorage.getItem(AUTH_USER_KEY);
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  const [user, setUser] = useState(getStoredUser);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistSession = useCallback((token, userInfo = null) => {
    if (!token) return;

    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    setAccessToken(token);

    if (userInfo) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const register = useCallback(
    async ({ username, email, password }) => {
      const data = await authApi.register({ username, email, password });
      persistSession(data.accessToken, data.user);
      return data;
    },
    [persistSession],
  );

  const login = useCallback(
    async ({ email, password }) => {
      const data = await authApi.login({ email, password });
      persistSession(data.accessToken, data.user);
      return data;
    },
    [persistSession],
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      const data = await authApi.google(credential);
      persistSession(data.accessToken, data.user);
      return data;
    },
    [persistSession],
  );

  const refreshAccessToken = useCallback(async () => {
    const data = await authApi.refreshToken();
    persistSession(data.accessToken, data.user || getStoredUser());
    return data.accessToken;
  }, [persistSession]);

  
  const updateProfile = useCallback(
    async ({ username, password, avatar_url }) => {
      const data = await authApi.updateProfile(accessToken, {
        username,
        password,
        avatar_url,
      });
      persistSession(data.accessToken, data.user);
      return data;
    },
    [accessToken, persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        await refreshAccessToken();
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [clearSession, refreshAccessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      register,
      login,
      loginWithGoogle,
      refreshAccessToken,
      updateProfile,
      logout,
      clearSession,
    }),
    [
      accessToken,
      user,
      isBootstrapping,
      register,
      login,
      loginWithGoogle,
      refreshAccessToken,
      updateProfile,
      logout,
      clearSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



