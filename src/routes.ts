import express from "express";
import { generateOTP, checkOTP } from "./controllers/auth/auth_functions"
import { activateOffer } from "./controllers/activation/activation_functions";
const router = express.Router();
router.post("/getcode",generateOTP)
router.get("/checkcode", checkOTP);
router.post("/activate", activateOffer)

export = router;