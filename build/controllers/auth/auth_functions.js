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
otplib_1.authenticator.options = { digits: 4 };
const _secret = "BlueTVKey";
// getting all posts
const generateOTP = function (request, response, next) {
    let telephoneNumber = request.body.telephone;
    return new Promise(function (resolve, reject) {
        generateSecret().then((secret) => {
            generateToken(secret).then((secretToken) => {
                sendAuthSMSToUserPhone(telephoneNumber, 
                // eslint-disable-next-line max-len
                "[Auth]: " + "Verification code: " + (secretToken)["token"] + ". DO NOT share this code with ANYONE", secretToken)
                    // eslint-disable-next-line max-len
                    .then((resultObject) => {
                    console.log("✔ SMS Sent | Success: " + (resultObject)["status"]);
                    resolve(resultObject);
                    next();
                }).catch((error) => {
                    console.log(error);
                    reject(error.message);
                });
            });
        });
    });
};
exports.generateOTP = generateOTP;
const checkOTP = function (request, response) {
    const _token = request.body.token;
    isAuthenticated(_token).then((isValid) => {
        return response.status(200).json({
            authed: isValid
        });
    });
};
exports.checkOTP = checkOTP;
function isAuthenticated(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve) {
            // @ts-ignore
            if (otplib_1.authenticator.verify({ token: token, secret: _secret })) {
                console.log("✔ User Authenticated");
            }
            else {
                console.log("✖ Error: User NOT Authenticated");
            }
            resolve(otplib_1.authenticator.verify({ token: token, secret: _secret }));
        });
    });
}
// eslint-disable-next-line no-unused-vars,require-jsdoc
function generateSecret() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            resolve(_secret);
            console.log("✔ OTP SecretKey Generated");
            console.log("-->> " + _secret + " <<--");
        });
    });
}
// eslint-disable-next-line require-jsdoc
function generateToken(secret) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            resolve({ secret: secret, token: otplib_1.authenticator.generate(secret) });
            console.log("✔ OTP Token Generated");
            // @ts-ignore
            console.log("-->> " + otplib_1.authenticator.generate(secret) + " <<--");
        });
    });
}
// eslint-disable-next-line require-jsdoc,max-len
function sendAuthSMSToUserPhone(telephone, smsBodyText, secretToken) {
    return __awaiter(this, void 0, void 0, function* () {
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
                resolve({ st: secretToken, status: response.status });
                console.log("-> SMS Request Response Data");
                // @ts-ignore
                console.log(JSON.stringify(response.data));
                console.log("-> Secret-Token Data");
                // @ts-ignore
                console.log(JSON.stringify(secretToken));
            })
                .catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    });
}
exports.default = { generateOTP: exports.generateOTP, checkOTP: exports.checkOTP };
