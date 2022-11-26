"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const auth_functions_1 = require("./controllers/auth/auth_functions");
const activation_functions_1 = require("./controllers/activation/activation_functions");
const test_1 = require("./test");
const router = express_1.default.Router();
router.post("/getcode", auth_functions_1.generateOTP);
router.post("/checkcode", auth_functions_1.checkOTP);
router.post("/activate", activation_functions_1.activateOffer);
router.post("/test", test_1.singularTest);
module.exports = router;
