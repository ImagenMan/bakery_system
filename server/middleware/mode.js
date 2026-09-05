const { models } = require("../models/context");

function attachModels(req, res, next) {
    const mode =
        req.session.mode === "TRAINING"
            ? "TRAINING"
            : "NORMAL";

    req.mode = mode;
    req.models =
        mode === "TRAINING"
            ? models.training
            : models.normal;

    next();
}

module.exports = {
    attachModels
};