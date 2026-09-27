const express = require("express");
const router = express.Router();

const user = require("../models/user");
const { requireAuth } = require("../middleware/auth");
const { productionDb, trainingDb } =
    require("../models/context");

function recordLogin(req, authenticatedUser) {
    const db =
        req.mode === "TRAINING"
            ? trainingDb
            : productionDb;

    const now =
        new Date();

    const recordDate =
        [
            now.getUTCFullYear(),
            String(now.getUTCMonth() + 1).padStart(2, "0"),
            String(now.getUTCDate()).padStart(2, "0")
        ].join("-");

    const eventAt =
        recordDate +
        " " +
        [
            String(now.getUTCHours()).padStart(2, "0"),
            String(now.getUTCMinutes()).padStart(2, "0"),
            String(now.getUTCSeconds()).padStart(2, "0")
        ].join(":");

    return db.transaction(() => {
        let dailyRecord =
            req.models.dailyRecord
                .getDailyRecordByDate(recordDate);

        if (!dailyRecord) {
            dailyRecord =
                req.models.dailyRecord
                    .openDailyRecord(recordDate);
        }

        const event =
            req.models.operationalEvent
                .createOperationalEvent({
                    event_type: "LOGIN",
                    event_at: eventAt,
                    daily_record_id:
                        dailyRecord.id,
                    user_id:
                        req.mode === "TRAINING"
                            ? 1
                            : authenticatedUser.id
                });

        return {
            dailyRecord,
            event
        };
    })();
}

function recordLogout(req, authenticatedUser) {
    const db =
        req.mode === "TRAINING"
            ? trainingDb
            : productionDb;

    const now =
        new Date();

    const recordDate =
        [
            now.getUTCFullYear(),
            String(now.getUTCMonth() + 1).padStart(2, "0"),
            String(now.getUTCDate()).padStart(2, "0")
        ].join("-");

    const eventAt =
        recordDate +
        " " +
        [
            String(now.getUTCHours()).padStart(2, "0"),
            String(now.getUTCMinutes()).padStart(2, "0"),
            String(now.getUTCSeconds()).padStart(2, "0")
        ].join(":");

    return db.transaction(() => {
        let dailyRecord =
            req.models.dailyRecord
                .getDailyRecordByDate(recordDate);

        if (!dailyRecord) {
            dailyRecord =
                req.models.dailyRecord
                    .openDailyRecord(recordDate);
        }

        const event =
            req.models.operationalEvent
                .createOperationalEvent({
                    event_type: "LOGOUT",
                    event_at: eventAt,
                    daily_record_id:
                        dailyRecord.id,
                    user_id:
                        req.mode === "TRAINING"
                            ? 1
                            : authenticatedUser.id
                });

        return {
            dailyRecord,
            event
        };
    })();
}

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

        recordLogin(
            req,
            authenticatedUser
        );

        req.session.userId =
            authenticatedUser.id;

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

        recordLogin(
            req,
            authenticatedUser
        );

        req.session.userId =
            authenticatedUser.id;

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

    try {
        if (req.session.userId) {
            const authenticatedUser =
                user.findById(
                    req.session.userId
                );

            recordLogout(
                req,
                authenticatedUser
            );
        }
    } catch (error) {
        console.error(
            "POST /api/auth/logout history error:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Logout failed."
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