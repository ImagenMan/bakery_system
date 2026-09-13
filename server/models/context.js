const fs = require("fs");
const path = require("path");
const { openDatabase } = require("../config/database");

const userModel = require("./user");
const customerModel = require("./customer");
const productModel = require("./product");
const customProductModel = require("./customProduct");
const orderModel = require("./order");
const productionItemModel = require("./productionItem");
const productionItemProductMappingModel =
    require("./productionItemProductMapping");
const productionAvailableModel = require("./productionAvailable");
const productionPlanModel = require("./productionPlan");
const productionSupplyModel = require("./productionSupply");
const productionOutputModel = require("./productionOutput");
const inventoryModel = require("./inventory");

const productionDb = require("../config/database");

const trainingDbPath = path.join(
    __dirname,
    "../../data/training.db"
);

if (!fs.existsSync(trainingDbPath)) {
    throw new Error(
        `Training database not found: ${trainingDbPath}`
    );
}

const trainingDb = openDatabase(trainingDbPath);
const authorizationUser = userModel.createUserModel(productionDb);

function createModels(db, authorizationUser) {
    return {
        user: userModel.createUserModel(db),
        customer: customerModel.createCustomerModel(db),
        product: productModel.createProductModel(db, authorizationUser),
        customProduct: customProductModel.createCustomProductModel(db, authorizationUser),
        order: orderModel.createOrderModel(
            db,
            authorizationUser,
            productionItemModel.createProductionItemModel(db),
            inventoryModel.createInventoryModel(db)
        ),
        productionItem: productionItemModel.createProductionItemModel(db),
        productionItemProductMapping:
            productionItemProductMappingModel
                .createProductionItemProductMappingModel(db),
        productionAvailable:
            productionAvailableModel.createProductionAvailableModel(
                db,
                inventoryModel.createInventoryModel(db)
            ),
        productionPlan:
            productionPlanModel.createProductionPlanModel(db),
        productionSupply:
            productionSupplyModel.createProductionSupplyModel(db),
        productionOutput:
            productionOutputModel.createProductionOutputModel(db),
        inventory:
            inventoryModel.createInventoryModel(db)
    };
}

const models = {
    normal: createModels(productionDb, authorizationUser),
    training: createModels(trainingDb, authorizationUser)
};

module.exports = {
    models,
    productionDb,
    trainingDb
};
