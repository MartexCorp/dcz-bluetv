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
exports.sendSMSToUserPhone = void 0;
const axios = require("axios").default;
const signale = require("signale");
function sendSMSToUserPhone(telephone, smsBodyText) {
    return __awaiter(this, void 0, void 0, function* () {
        signale.info("Send SMS started...");
        return new Promise((resolve, reject) => {
            // @ts-ignore
            var data = JSON.stringify({
                "phoneNumber": `${telephone}`,
                "code": `${smsBodyText}`
            });
            var config = {
                method: 'post',
                url: 'http://192.168.240.233:80/SMSWebServiceApp/webresources/Configs/sendTVSMS',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };
            axios(config)
                .then((response) => {
                if (response.status == 200) {
                    signale.success("SMS successfully sent"); // @ts-ignore
                    resolve({ status: response.status });
                }
                else {
                    signale.warn("SMS status returns code " + response.status + ". Please check your messaging API.");
                }
            })
                .catch((error) => {
                signale.error("SMS Sending Axios Request error... " + error.message);
                reject(error.message);
            });
        });
    });
}
exports.sendSMSToUserPhone = sendSMSToUserPhone;
exports.default = { sendSMSToUserPhone };
