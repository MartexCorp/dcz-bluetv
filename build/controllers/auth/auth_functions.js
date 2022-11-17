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
const notif_functions_1 = require("../notification/notif_functions");
const axios = require("axios").default;
const signale = require("signale");
const crypto = require("crypto");
otplib_1.totp.options = { digits: 6, step: 300 }; // step (s) 60*5
const generateOTP = function (request, response, next) {
    let telephoneNumber = request.body.telephone;
    return new Promise(function (resolve, reject) {
        generateSecret(telephoneNumber).then((secret) => {
            generateToken(secret).then((secretTokenObject) => {
                sendAuthSMSToUserPhone(telephoneNumber, 
                // eslint-disable-next-line max-len
                "[Auth]: " + "Verification code: " + (secretTokenObject)["token"] + ". DO NOT share this code with ANYONE", secretTokenObject)
                    // eslint-disable-next-line max-len
                    .then((resultStatus) => {
                    signale.success("SMS Sent | Success: " + resultStatus);
                    let statusObject = { secret: "OK", token: "OK", sms: "OK" };
                    resolve(statusObject);
                    return response.status(200).json(statusObject);
                }).catch((error) => {
                    signale.error("Error in SMS Auth Promise..." + error);
                    let statusObject = { secret: "OK", token: "OK", sms: error.message };
                    return response.json(statusObject);
                });
            }).catch((error) => {
                signale.error("Error in Generate Token Promise..." + error);
                let statusObject = { secret: "OK", token: error.message };
                return response.json(statusObject);
            });
        }).catch((error) => {
            signale.error("Error in Generate Secret Promise..." + error);
            let statusObject = { secret: error.message };
            return response.json(statusObject);
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
            used: otplib_1.totp.timeUsed(),
            token: _token,
            number: _number,
            secret: _secret
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
function sendAuthSMSToUserPhone(telephone, smsBodyText, secretTokenObject) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            signale.info("Sending Auth SMS to User started...");
            (0, notif_functions_1.sendSMSToUserPhone)(telephone, smsBodyText).then((SMSResponseStatus) => {
                signale.success(`SMS Response status = ${SMSResponseStatus["status"]}`);
                resolve(SMSResponseStatus["status"]);
            }).catch((error) => {
                signale.error("Error in SendAuthSMSToUserPhone Promise...");
                reject(error);
            });
        });
    });
}
exports.default = { generateOTP: exports.generateOTP, checkOTP: exports.checkOTP };
