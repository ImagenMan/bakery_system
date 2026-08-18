const user = require("../models/user");

function requireAuth(req, res, next) {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const authenticatedUser =
            user.findById(req.session.userId);

        if (!authenticatedUser.active) {
            req.session.destroy(() => {});
            return res.status(401).json({
                success: false,
                error: "User is not active."
            });
        }

        req.user = authenticatedUser;

        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);

        return res.status(401).json({
            success: false,
            error: "Authentication required."
        });
    }
}

function requireAdmin(req, res, next) {
    try {
        requireAuth(req, res, () => {
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({
                    success: false,
                    error: "Admin authorization is required."
                });
            }

            next();
        });
    } catch (error) {
        console.error("Admin authorization middleware error:", error);

        return res.status(403).json({
            success: false,
            error: "Admin authorization is required."
        });
    }
}

module.exports = {
    requireAuth,
    requireAdmin
};