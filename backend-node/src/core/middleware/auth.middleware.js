import { verifyAccessToken } from "../utils/jwt.js";


export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin permission required" });
    }

    next();
};
