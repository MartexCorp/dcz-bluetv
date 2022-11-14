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
exports.activateOffer = void 0;
const notif_functions_1 = require("../notification/notif_functions");
const xml2js = require("xml2js");
const axios = require("axios").default;
const signale = require("signale");
const activateOffer = function (request, response) {
    const _subscriber = request.body.subscriberNumber;
    const _offerID = request.body.offerID;
    ChangeOptionalOffer(_subscriber, _offerID).then((result) => {
        if (result["resultCode"] == 405000000) {
            signale.success("Offer Subscription Successful at CRM");
            addCustomerMwareTV(_subscriber).then((result) => __awaiter(this, void 0, void 0, function* () {
                yield (0, notif_functions_1.sendSMSToUserPhone)(_subscriber, "[Auth]: login:" + result["id"] + "\n" + "pass:" + result["pass"] + "\n" + "Do not share this code with anyone else!");
                console.log("✔ Offer Subscription Successful on MWareTV");
                console.log(result);
            }));
        }
        else {
            console.log("✖ Offer Subscription went through but was not successful at CRM");
            console.log(" Result Code -->> " + result["resultCode"]);
            console.log(" Result Message -->> " + result["resultMessage"]);
        }
        return response.status(200).json({
            result: result
        });
    }).catch((err) => {
        signale.error(err);
    });
    //next();
};
exports.activateOffer = activateOffer;
const ChangeOptionalOffer = function (subscriber, offerID) {
    signale.info("CRM Change Optional Offer started...");
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        const data = "<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:msg=\"http://oss.huawei.com/business/intf/webservice/subscribe/msg\">\n    <soapenv:Header/>\n    <soapenv:Body>\n        <msg:ChangeOptionalOfferRequestMsg>\n            <RequestHeader>\n                <msg:Version>1</msg:Version> <!--DO NOT TOUCH-->\n                <msg:TransactionId>1</msg:TransactionId> <!--DO NOT TOUCH-->\n                <msg:SequenceId>1</msg:SequenceId> <!--DO NOT TOUCH-->\n                <msg:RequestType>Event</msg:RequestType> <!--DO NOT TOUCH-->\n                <msg:ThirdPartyID>156</msg:ThirdPartyID> <!--SOAP Client / Blue Recharge App ID-->\n                <msg:SerialNo>" + new Date().valueOf().toString() + "</msg:SerialNo> <!--Real Transaction ID to be set by SOAP Client-->\n                <msg:Remark>wsr</msg:Remark> <!--Transaction Remark / Comment-->\n            </RequestHeader>\n            <ChangeOptionalOfferRequest>\n                <msg:SubscriberNo>" + subscriber + "</msg:SubscriberNo> <!--Number benefitting from Activation -->\n                <msg:OptionalOffer>\n                    <msg:Id>" + offerID + "</msg:Id> <!--Optional Offer ID-->\n                    <msg:OperationType>1</msg:OperationType> <!--DO NOT TOUCH-->\n                </msg:OptionalOffer>\n                <msg:PrimaryOfferOrderKey>?</msg:PrimaryOfferOrderKey> <!--DO NOT TOUCH-->\n            </ChangeOptionalOfferRequest>\n        </msg:ChangeOptionalOfferRequestMsg>\n    </soapenv:Body>\n</soapenv:Envelope>";
        const config = {
            method: "post",
            url: "http://192.168.240.7:8280/services/Proxy_SubscribeOptonnal",
            headers: {
                "Content-Type": "text/xml",
                "SOAPAction": "changeOptionalOffer",
                "Cookie": "JSESSIONID=0000SofIn7txUf9htTuC0GrV4Gw:-1",
            },
            data: data,
        };
        axios(config)
            .then(function (response) {
            signale.info("Optional Offer Axios request sent...");
            // @ts-ignore
            xml2js.parseStringPromise(response.data).then((result) => {
                signale.info("Optional Offer Axios request sent...");
                // @ts-ignore
                // eslint-disable-next-line max-len
                const responseCode = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultCode"][0];
                // eslint-disable-next-line max-len
                const responseMessage = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultDesc"][0];
                // eslint-disable-next-line max-len
                signale.note(`CRM OfferSubscribe Result Code: ${responseCode}`);
                signale.note(`CRM OfferSubscribe Result Message: ${{ responseMessage }}`);
                resolve({ resultCode: responseCode,
                    resultMessage: responseMessage });
            }).catch(function (error) {
                signale.error("Error has occurred in the AddCustomer Axios Request... " + error.message);
                reject(error.message);
            });
        });
    });
};
function addCustomerMwareTV(telephoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        signale.info("MWare Add Customer started...");
        return new Promise((resolve, reject) => {
            const config = {
                method: "post",
                url: "https://camtel.imsserver2.tv/api/AddCustomer/addCustomer?productid=1&subscriptionlengthinmonths=0&subscriptionlengthindays=1&renewalinterval=1&cmsService=Content&crmService=Sandbox&reseller_id=0&order_id=0&authToken=a81d6672-28f8-4e1b-88ad-b233195d12f2&StartSubscriptionFromFirstLogin=true&sendMail=false&firstname=David&lastname=Martex&street=Happy2000&zipcode=13062&city=Yaounde&state=CE&country=Cameroon&phone=+237620050328&mobile=+237655345987&email=620050328@camtel.cm&userid=+237" + telephoneNumber + "&sendSMS=false",
                headers: {}
            };
            axios(config)
                .then(function (response) {
                // @ts-ignore
                // console.log(JSON.stringify(response.data));
                if (response.status == 200) {
                    const credentialsJSON = JSON.parse(response.data.toString().replace(/\\/g, ""));
                    let id = credentialsJSON["loginid"];
                    let pass = credentialsJSON["password"];
                    if (id != null && pass != null) {
                        signale.success("Successfully retrieved Login and Pass from MWareTV");
                        signale.note("MWareTv Id: " + id);
                        signale.note("MWareTV Pass: " + pass);
                        resolve({ id: credentialsJSON["loginid"], pass: credentialsJSON["password"] });
                    }
                    else {
                        signale.warn("ID and Pass not found");
                    }
                }
                else {
                    signale.warn("Response status code is " + response.status);
                    signale.info("Response message is " + response.data);
                }
            })
                .catch(function (error) {
                signale.error("Error has occurred in the AddCustomer Axios Request... " + error.message);
                reject(error.message);
            });
        });
    });
}
exports.default = { activateOffer: exports.activateOffer };
