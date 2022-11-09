import { NextFunction, Request, Response } from "express";
import { authenticator } from "otplib";
const xml2js = require("xml2js");
const axios = require("axios").default;


export const activateOffer = function(request: Request, response: Response){
  const _subscriber = request.body.subscriberNumber;
  const _offerID = request.body.offerID;

  ChangeOptionalOffer(_subscriber,_offerID).then((result)=>{
    return response.status(200).json({
      result:result
    });
  });
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

export default { activateOffer };