import { NextFunction, Request, Response } from "express";
import { sendAuthSMSToUserPhone } from "../notification/notif_functions";

const xml2js = require("xml2js");
const axios = require("axios").default;


export const activateOffer = function(request: Request, response: Response, next:NextFunction){
  const _subscriber = request.body.subscriberNumber;
  const _offerID = request.body.offerID;

  ChangeOptionalOffer(_subscriber,_offerID).then((result)=>{
    if(result["resultCode"]==405000000){
      console.log("✔ Offer Subscription Successful at CRM");
      addCustomerMwareTV(_subscriber).then(async (result)=>{
        await sendAuthSMSToUserPhone(_subscriber,"[Auth]: login:"+result["loginid"]+"\n"+"pass:"+result["password"]+"\n"+"Do not share this code with anyone else!");
        console.log("✔ Offer Subscription Successful on MWareTV");
        console.log(result);
      });
    }else{
       console.log("✖ Offer Subscription went through but was not successful at CRM");
       console.log(" Result Code -->> "+ result["resultCode"]);
       console.log(" Result Message -->> "+ result["resultMessage"]);

    }
    return response.status(200).json({
      result:result
    });
  }).catch((err)=>{
    console.log("✖ Change Offer Subscription did not go through -->> "+ err);
  })
  next();
}


const ChangeOptionalOffer = function(subscriber:string, offerID:string): Promise<object> {

  return new Promise(function(resolve, reject) {
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
      .then(function(response: { data: any; }) {
        // @ts-ignore
        console.log(JSON.stringify(response.data));
        xml2js.parseStringPromise(response.data).then((result: any) => {
          // @ts-ignore
          console.dir(JSON.stringify(result));
          // eslint-disable-next-line max-len
          const responseCode = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultCode"][0];
          // eslint-disable-next-line max-len
          const responseMessage = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultDesc"][0];
          // eslint-disable-next-line max-len

          resolve({resultCode: responseCode,
            resultMessage: responseMessage});
        }).catch(function(error: any) {
          console.log(error);
          reject(error);
        });
      });
  });
}


async function addCustomerMwareTV(telephoneNumber):Promise<object>{
  return new Promise((resolve, reject) => {
    const config = {
      method: "post",
      url: "https://camtel.imsserver2.tv/api/AddCustomer/addCustomer?productid=1&subscriptionlengthinmonths=0&subscriptionlengthindays=1&renewalinterval=1&cmsService=Content&crmService=Sandbox&reseller_id=0&order_id=0&authToken=a81d6672-28f8-4e1b-88ad-b233195d12f2&StartSubscriptionFromFirstLogin=true&sendMail=false&firstname=David&lastname=Martex&street=Happy2000&zipcode=13062&city=Yaounde&state=CE&country=Cameroon&phone=+237620050328&mobile=+237655345987&email=620050328@camtel.cm&userid=+237"+telephoneNumber+"&sendSMS=false",
      headers: {}
    };

    axios(config)
      .then(function (response) {
        // @ts-ignore
        // console.log(JSON.stringify(response.data));
        const credentialsJSON = JSON.parse(response.data.toString().replace(/\\/g, ""));
        console.log(credentialsJSON["loginid"])
        resolve({id: credentialsJSON["loginid"],pass: credentialsJSON["password"]});
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });

  })
}

export default { activateOffer };