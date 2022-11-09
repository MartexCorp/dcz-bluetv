"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const generateToken_1 = require("../controllers/auth/generateToken");
const router = express_1.default.Router();
router.get("/getcode", generateToken_1.generateOTP);
router.get("/checkcode", generateToken_1.checkOTP);
module.exports = router;
