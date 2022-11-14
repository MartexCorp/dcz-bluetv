"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOTP = exports.generateOTP = void 0;
const otplib_1 = require("otplib");
const axios = require("axios").default;
const signale = require("signale");
const crypto = require("crypto");
otplib_1.totp.options = { digits: 6, step: 300 }; // step (s) 60*5
signale.config({
    displayFilename: true,
    displayTimestamp: true,
    displayDate: false,
    displayLabel: true
});
const generateOTP = function (request, response, next) {
    let telephoneNumber = request.body.telephone;
    return new Promise(function (resolve, reject) {
        generateSecret(telephoneNumber).then((secret) => {
            generateToken(secret).then((secretToken) => {
                sendAuthSMSToUserPhone(telephoneNumber, 
                // eslint-disable-next-line max-len
                "[Auth]: " + "Verification code: " + (secretToken)["token"] + ". DO NOT share this code with ANYONE", secretToken)
                    // eslint-disable-next-line max-len
                    .then((resultObject) => {
                    signale.success("SMS Sent | Success: " + (resultObject)["status"]);
                    resolve(resultObject);
                    next(resultObject);
                }).catch((error) => {
                    signale.error("Error in SMS Auth Promise..." + error);
                    next(error);
                });
            }).catch((error) => {
                signale.error("Error in Generate Token Promise..." + error);
            });
        }).catch((error) => {
            signale.error("Error in Generate Secret Promise..." + error);
        });
    });
};
exports.generateOTP = generateOTP;
const checkOTP = function (request, response) {
    const _token = request.body.token;
    const _number = request.body.number;
    const _secret = crypto.createHash("md5").update(_number).digest("hex");
    isAuthenticated(_secret, _token).then((isValid) => {
        return response.status(200).json({
            authed: isValid,
            left: otplib_1.totp.timeRemaining(),
            used: otplib_1.totp.timeUsed()
        });
    });
};
exports.checkOTP = checkOTP;
function isAuthenticated(secret, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            // @ts-ignore
            if (otplib_1.totp.check(token, secret)) {
                signale.success("User Authenticated");
            }
            else {
                signale.error("Error: User NOT Authenticated");
            }
            resolve(otplib_1.totp.check(token, secret));
        });
    });
}
// eslint-disable-next-line no-unused-vars,require-jsdoc
function generateSecret(telephoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const _secret = crypto.createHash("md5").update(telephoneNumber).digest("hex");
            resolve(_secret);
            signale.success("OTP SecretKey Generated");
            signale.note("-->> " + _secret + " <<--");
        });
    });
}
// eslint-disable-next-line require-jsdoc
function generateToken(secret) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            resolve({ secret: secret, token: otplib_1.totp.generate(secret) });
            signale.success("OTP Token Generated");
            signale.note("-->> " + otplib_1.totp.generate(secret) + " <<--");
            signale.note(`Time Remaining: ${otplib_1.totp.timeRemaining()}`);
        });
    });
}
// eslint-disable-next-line require-jsdoc,max-len
function sendAuthSMSToUserPhone(telephone, smsBodyText, secretToken) {
    return __awaiter(this, void 0, void 0, function* () {
        signale.info("Sending Auth SMS to User started...");
        return new Promise((resolve, reject) => {
            // @ts-ignore
            const data = JSON.stringify({
                "recipient": "+237" + telephone,
                "text": smsBodyText,
            });
            var config = {
                method: "get",
                url: "http://172.20.24.77:9501/api?action=sendmessage&username=mwaretv&password=mwaretv1234&recipient=237" + telephone + "&messagetype=SMS:TEXT&messagedata=" + smsBodyText,
                headers: {}
            };
            axios.request(config)
                .then((response) => {
                if (response.status == 200) {
                    signale.success("SMS sent to user successfully");
                    signale.note("Secret Token: " + secretToken);
                    resolve({ st: secretToken, status: response.status });
                }
                else {
                    signale.warn("SMS API response code is " + response.status);
                }
            })
                .catch((error) => {
                signale.error(error.message);
                reject(error.message);
            });
        });
    });
}
exports.default = { generateOTP: exports.generateOTP, checkOTP: exports.checkOTP };
