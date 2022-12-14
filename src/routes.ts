import express from "express";
import { generateOTP, checkOTP } from "./controllers/auth/auth_functions"
import { activateOffer} from "./controllers/activation/activation_functions";
import {singularTest} from "./test";

const router = express.Router();

router.post("/getcode",generateOTP)
router.post("/checkcode", checkOTP);
router.post("/activate", activateOffer)
router.post("/test", singularTest)


export = router;