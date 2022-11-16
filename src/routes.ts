import express from "express";
import { generateOTP, checkOTP } from "./controllers/auth/auth_functions"
import { activateOffer } from "./controllers/activation/activation_functions";

const router = express.Router();

router.post("/getcode",generateOTP)
router.post("/checkcode", checkOTP);
router.post("/activate", activateOffer)

export = router;