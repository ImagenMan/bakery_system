const express = require("express");
const router = express.Router();

const user = require("../models/user");
const { requireAuth } = require("../middleware/auth");

// =========================================================
// Login with username/password
// =========================================================

router.post("/login/password", (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            !username.trim()
        ) {
            return res.status(400).json({
                success: false,
                error: "Username is required."
            });
        }

        if (
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                error: "Password is required."
            });
        }

        const authenticatedUser =
            user.verifyPassword(username, password);

        req.session.userId = authenticatedUser.id;

        res.json({
            success: true,
            data: authenticatedUser
        });

    } catch (error) {
        console.error(
            "POST /api/auth/login/password error:",
            error
        );

        if (
            error.message === "Invalid username or password." ||
            error.message === "User is not active." ||
            error.message.includes("not configured")
        ) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Login failed."
        });
    }
});

// =========================================================
// Login with user ID + PIN
// =========================================================

router.post("/login/pin", (req, res) => {
    try {
        const { user_id, pin } = req.body;

        const userId = Number(user_id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                error: "Valid user ID is required."
            });
        }

        if (
            typeof pin !== "string" ||
            !/^\d{4}$/.test(pin)
        ) {
            return res.status(400).json({
                success: false,
                error: "PIN must be exactly 4 digits."
            });
        }

        const authenticatedUser =
            user.verifyPin(userId, pin);

        req.session.userId = authenticatedUser.id;

        res.json({
            success: true,
            data: authenticatedUser
        });

    } catch (error) {
        console.error(
            "POST /api/auth/login/pin error:",
            error
        );

        if (
            error.message === "User not found." ||
            error.message === "Invalid PIN." ||
            error.message === "User is not active." ||
            error.message.includes("not configured")
        ) {
            return res.status(401).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Login failed."
        });
    }
});

// =========================================================
// Current authenticated user
// =========================================================

router.get("/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        data: req.user
    });
});

// =========================================================
// Logout
// =========================================================

router.post("/logout", (req, res) => {
    if (!req.session) {
        return res.json({
            success: true
        });
    }

    req.session.destroy(error => {
        if (error) {
            console.error(
                "POST /api/auth/logout error:",
                error
            );

            return res.status(500).json({
                success: false,
                error: "Logout failed."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true
        });
    });
});

module.exports = router;