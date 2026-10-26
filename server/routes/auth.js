const express = require("express");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../middleware/auth");
const { productionDb, trainingDb } =
    require("../models/context");

const {
    getBusinessDate,
    getCurrentEventAt
} = require("../utils/businessTime");

function recordLogin(req, authenticatedUser) {
    const db =
        req.mode === "TRAINING"
            ? trainingDb
            : productionDb;

    const recordDate =
        getBusinessDate();

    const eventAt =
        getCurrentEventAt();

    return db.transaction(() => {
        let dailyRecord =
            req.models.dailyRecord
                .getDailyRecordByDate(recordDate);

        if (!dailyRecord) {
            dailyRecord =
                req.models.dailyRecord
                    .createDailyRecord(recordDate);
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

    const recordDate =
        getBusinessDate();

    const eventAt =
        getCurrentEventAt();

    return db.transaction(() => {
        let dailyRecord =
            req.models.dailyRecord
                .getDailyRecordByDate(recordDate);

        if (!dailyRecord) {
            dailyRecord =
                req.models.dailyRecord
                    .createDailyRecord(recordDate);
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
// Application Mode (selected before login)
// =========================================================

router.get("/mode", (req, res) => {
    const mode =
        req.session.mode === "TRAINING"
            ? "TRAINING"
            : "NORMAL";

    res.json({
        success: true,
        mode
    });
});

router.post("/mode", (req, res) => {
    if (req.session.userId) {
        return res.status(409).json({
            success: false,
            error: "Log out before changing application mode."
        });
    }

    const { mode } = req.body;

    if (mode !== "NORMAL" && mode !== "TRAINING") {
        return res.status(400).json({
            success: false,
            error: "Invalid application mode."
        });
    }

    req.session.mode = mode;

    res.json({
        success: true,
        mode
    });
});

// =========================================================
// Unified login: username + role-specific credential
// =========================================================

router.post("/login", (req, res) => {
    const { username, credential } = req.body || {};

    if (
        req.session.mode !== "NORMAL" &&
        req.session.mode !== "TRAINING"
    ) {
        return res.status(400).json({
            success: false,
            error: "Select Normal or Training mode before logging in."
        });
    }

    if (
        typeof username !== "string" ||
        !username.trim() ||
        typeof credential !== "string" ||
        !credential
    ) {
        return res.status(401).json({
            success: false,
            error: "Invalid username or credential."
        });
    }

    let authenticatedUser;

    try {
        const selectedUser =
            req.models.user.findByUsername(username.trim());

        if (!selectedUser || !selectedUser.active) {
            throw new Error("Invalid username or credential.");
        }

        if (selectedUser.role === "ADMIN") {
            authenticatedUser =
                req.models.user.verifyPassword(
                    username.trim(),
                    credential
                );
        } else if (selectedUser.role === "COUNTER") {
            if (!/^\d{4}$/.test(credential)) {
                throw new Error("Invalid username or credential.");
            }

            authenticatedUser =
                req.models.user.verifyPinByUsername(
                    username.trim(),
                    credential
                );
        } else {
            throw new Error("Invalid username or credential.");
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid username or credential."
        });
    }

    try {
        recordLogin(req, authenticatedUser);

        req.session.userId = authenticatedUser.id;

        return res.json({
            success: true,
            data: authenticatedUser
        });
    } catch (error) {
        console.error("POST /api/auth/login error:", error);

        return res.status(500).json({
            success: false,
            error: "Login failed."
        });
    }
});

// =========================================================
// User management
// =========================================================

router.get("/users", requireAdmin, (req, res) => {
    try {

        res.json({
            success: true,
            data: req.models.user.listUsers()
        });

    } catch (error) {

        console.error(
            "GET /api/auth/users error:",
            error
        );

        res.status(500).json({
            success: false,
            error: "Unable to load users."
        });
    }
});


router.post("/users", requireAdmin, (req, res) => {
    try {

        const {
            name,
            username,
            password,
            pin,
            role,
            language,
            active
        } = req.body;

        const createdUser =
            req.models.user.createUser({
                name,
                username,
                password,
                pin,
                role,
                language,
                active
            });

        res.status(201).json({
            success: true,
            data: createdUser
        });

    } catch (error) {

        console.error(
            "POST /api/auth/users error:",
            error
        );

        if (
            error.message.includes("required") ||
            error.message.includes("Invalid") ||
            error.message.includes("already in use") ||
            error.message.includes("exactly 4 digits") ||
            error.message.includes("at least 8 characters")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Unable to create user."
        });
    }
});


router.put("/users/:id", requireAdmin, (req, res) => {
    try {

        const userId =
            Number(req.params.id);

        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {
            return res.status(400).json({
                success: false,
                error: "Valid user ID is required."
            });
        }

        const updatedUser =
            req.models.user.updateUser(
                userId,
                req.body
            );

        res.json({
            success: true,
            data: updatedUser
        });

    } catch (error) {

        console.error(
            "PUT /api/auth/users/:id error:",
            error
        );

        if (
            error.message === "User not found." ||
            error.message.includes("required") ||
            error.message.includes("Invalid") ||
            error.message.includes("already in use") ||
            error.message.includes("last active Admin") ||
            error.message.includes("Active Counter users") ||
            error.message.includes("User role cannot be changed.")
        ) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: "Unable to update user."
        });
    }
});


router.post(
    "/users/:id/reset-password",
    requireAdmin,
    (req, res) => {
        try {

            const userId =
                Number(req.params.id);

            if (
                !Number.isInteger(userId) ||
                userId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Valid user ID is required."
                });
            }

            const updatedUser =
                req.models.user.setPassword(
                    userId,
                    req.body.password
                );

            res.json({
                success: true,
                data: updatedUser
            });

        } catch (error) {

            console.error(
                "POST /api/auth/users/:id/reset-password error:",
                error
            );

            if (
                error.message === "User not found." ||
                error.message.includes("Password must") ||
                error.message.includes(
                    "Password credentials are only available"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Unable to reset password."
            });
        }
    }
);


router.post(
    "/users/:id/reset-pin",
    requireAdmin,
    (req, res) => {
        try {

            const userId =
                Number(req.params.id);

            if (
                !Number.isInteger(userId) ||
                userId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    error: "Valid user ID is required."
                });
            }

            const updatedUser =
                req.models.user.setPin(
                    userId,
                    req.body.pin
                );

            res.json({
                success: true,
                data: updatedUser
            });

        } catch (error) {

            console.error(
                "POST /api/auth/users/:id/reset-pin error:",
                error
            );

            if (
                error.message === "User not found." ||
                error.message.includes("PIN must") ||
                error.message.includes(
                    "PIN credentials are only available"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Unable to reset PIN."
            });
        }
    }
);


// =========================================================
// Change own password
// =========================================================

router.post(
    "/change-password",
    requireAuth,
    (req, res) => {
        try {

            const {
                currentPassword,
                newPassword
            } = req.body;

            if (req.user.role !== "ADMIN") {
                return res.status(400).json({
                    success: false,
                    error:
                        "Password changes are only available for Admin users."
                });
            }

            const authenticatedUser =
                req.models.user.verifyPassword(
                    req.user.username,
                    currentPassword
                );

            if (
                authenticatedUser.id !==
                req.user.id
            ) {
                throw new Error(
                    "Unable to change password."
                );
            }

            const updatedUser =
                req.models.user.setPassword(
                    req.user.id,
                    newPassword
                );

            res.json({
                success: true,
                data: updatedUser
            });

        } catch (error) {

            console.error(
                "POST /api/auth/change-password error:",
                error
            );

            if (
                error.message ===
                    "Invalid username or password." ||
                error.message.includes("Password must")
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        error.message ===
                            "Invalid username or password."
                            ? "Current password is incorrect."
                            : error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Unable to change password."
            });
        }
    }
);


// =========================================================
// Change own PIN
// =========================================================

router.post(
    "/change-pin",
    requireAuth,
    (req, res) => {
        try {

            const {
                currentPin,
                newPin
            } = req.body;

            if (req.user.role !== "COUNTER") {
                return res.status(400).json({
                    success: false,
                    error:
                        "PIN changes are only available for Counter users."
                });
            }

            req.models.user.verifyPin(
                req.user.id,
                currentPin
            );

            const updatedUser =
                req.models.user.setPin(
                    req.user.id,
                    newPin
                );

            res.json({
                success: true,
                data: updatedUser
            });

        } catch (error) {

            console.error(
                "POST /api/auth/change-pin error:",
                error
            );

            if (
                error.message === "Invalid PIN." ||
                error.message === "PIN must be exactly 4 digits."
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        error.message === "Invalid PIN."
                            ? "Current PIN is incorrect."
                            : error.message
                });
            }

            res.status(500).json({
                success: false,
                error: "Unable to change PIN."
            });
        }
    }
);


// =========================================================
// Current authenticated user
// =========================================================

router.get("/me", requireAuth, (req, res) => {
    res.json({
        success: true,
        data: req.user,
        mode:
            req.session.mode === "TRAINING"
                ? "TRAINING"
                : "NORMAL"
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
                req.models.user.findById(
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