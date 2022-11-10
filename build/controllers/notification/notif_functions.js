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
exports.sendAuthSMSToUserPhone = exports.sendSMS = void 0;
const axios = require("axios").default;
const sendSMS = function (request, response) {
    const _subscriber = request.body.subscriberNumber;
    const _message = request.body.message;
    sendAuthSMSToUserPhone(_subscriber, _message).then((result) => {
        return response.status(200).json({
            result: result
        });
    });
};
exports.sendSMS = sendSMS;
function sendAuthSMSToUserPhone(telephone, smsBodyText) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            // @ts-ignore
            var config = {
                method: "get",
                url: "http://172.20.24.77:9501/api?action=sendmessage&username=mwaretv&password=mwaretv1234&recipient=237" + telephone + "&messagetype=SMS:TEXT&messagedata=" + smsBodyText,
                headers: {}
            };
            axios.request(config)
                .then((response) => {
                resolve({ status: response.status });
                console.log("-> SMS Request Response Data");
                // @ts-ignore
            })
                .catch((error) => {
                console.log(error);
                reject(error);
            });
        });
    });
}
exports.sendAuthSMSToUserPhone = sendAuthSMSToUserPhone;
exports.default = { sendSMS: exports.sendSMS };
