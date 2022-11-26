import express from "express";
import { generateOTP, checkOTP } from "./controllers/auth/auth_functions"
import { activateOffer, getCRMSubscriberDetails} from "./controllers/activation/activation_functions";

const router = express.Router();

router.post("/getcode",generateOTP)
router.post("/checkcode", checkOTP);
router.post("/activate", activateOffer)
router.post("/test", getCRMSubscriberDetails)


export = router;