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
otplib_1.totp.options = { digits: 6, epoch: 0 };
const _secret = "BlueTVKey";
// getting all posts
const generateOTP = function (request, response) {
    let telephoneNumber = request.body.telephone;
    return new Promise(function (resolve, reject) {
        generateSecret().then((secret) => {
            generateToken(secret).then((secretToken) => {
                sendAuthSMSToUserPhone(telephoneNumber, "Blue TV", 
                // eslint-disable-next-line max-len
                "[Auth]: " + "Verification code: " + Object(secretToken)["token"] + ". DO NOT share this code with ANYONE", secretToken)
                    // eslint-disable-next-line max-len
                    .then((resultObject) => {
                    console.log("✔ SMS Sent | Success: " + Object(resultObject)["status"]);
                    resolve(resultObject);
                }).catch((error) => {
                    console.log(error);
                    reject(error.message);
                });
                return 0;
            });
            return 0;
        });
        return 0;
    });
};
exports.generateOTP = generateOTP;
const checkOTP = function (request, response) {
    const _token = request.body.token;
    return new Promise(function (resolve, reject) {
        resolve(otplib_1.totp.verify({ secret: _secret, token: _token }));
        if (otplib_1.totp.verify({ secret: _secret, token: _token })) {
            console.log("✔ User Authenticated");
        }
        else {
            console.log("✖ Error: User NOT Authenticated");
        }
    });
};
exports.checkOTP = checkOTP;
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
            resolve({ secret: secret, token: otplib_1.totp.generate(secret) });
            console.log("✔ OTP Token Generated");
            console.log("-->> " + otplib_1.totp.generate(secret) + " <<--");
        });
    });
}
// eslint-disable-next-line require-jsdoc,max-len
function sendAuthSMSToUserPhone(telephone, smsSenderName, smsBodyText, secretToken) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            getSMSAPIKey().then((smsApiKey) => {
                // @ts-ignore
                const data = JSON.stringify({
                    "sender": smsSenderName,
                    "recipient": "+237" + telephone,
                    "text": smsBodyText,
                });
                const config = {
                    method: "post",
                    url: "https://api.avlytext.com/v1/sms?api_key=" + smsApiKey,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    data: data,
                };
                axios.request(config)
                    .then((response) => {
                    resolve({ st: secretToken, status: response.status });
                    console.log("- SMS Request Response Data");
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
    });
}
function getSMSAPIKey() {
    return __awaiter(this, void 0, void 0, function* () {
        let SMSAPIKey = "aliKwBsHPZdQE8LUBtdRpF6glPzhfexefu2PNB3bo8Hff4i8YxW1Hqq63sLC5kvoSm89";
        console.log("✔ Gotten SMS API Key");
        console.log("-->> " + SMSAPIKey + " <<--");
        return SMSAPIKey;
    });
}
// updating a post
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // get the post id from the req.params
    let id = req.params.id;
    // get the data from req.body
    let title = (_a = req.body.title) !== null && _a !== void 0 ? _a : null;
    let body = (_b = req.body.body) !== null && _b !== void 0 ? _b : null;
    // update the post
    let response = yield axios.put(`https://jsonplaceholder.typicode.com/posts/${id}`, Object.assign(Object.assign({}, (title && { title })), (body && { body })));
    // return response
    return res.status(200).json({
        message: response.data
    });
});
// deleting a post
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get the post id from req.params
    let id = req.params.id;
    // delete the post
    let response = yield axios.delete(`https://jsonplaceholder.typicode.com/posts/${id}`);
    // return response
    return res.status(200).json({
        message: 'post deleted successfully'
    });
});
// adding a post
const addPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // get the data from req.body
    let title = req.body.title;
    let body = req.body.body;
    // add the post
    let response = yield axios.post(`https://jsonplaceholder.typicode.com/posts`, {
        title,
        body
    });
    // return response
    return res.status(200).json({
        message: response.data
    });
});
exports.default = { generateOTP: exports.generateOTP, checkOTP: exports.checkOTP };
