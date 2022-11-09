import { NextFunction, Request, Response } from "express";
import { checkOTP, generateOTP } from "../auth/auth_functions";

const axios = require("axios").default;


export const sendSMS = function(request: Request, response: Response) {
  const _subscriber = request.body.subscriberNumber;
  const _message = request.body.message;

  sendAuthSMSToUserPhone(_subscriber, _message).then((result) => {
    return response.status(200).json({
      result: result
    });
  });
};

async function sendAuthSMSToUserPhone(telephone: string, smsBodyText: string): Promise<object> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    var config = {
      method: "get",
      url: "http://172.20.24.77:9501/api?action=sendmessage&username=mwaretv&password=mwaretv1234&recipient=237" + telephone + "&messagetype=SMS:TEXT&messagedata=" + smsBodyText,
      headers: {}
    };
    axios.request(config)
      .then((response: any) => {
        resolve({ status: response.status });
        console.log("-> SMS Request Response Data");
        // @ts-ignore
      })
      .catch((error: any) => {
        console.log(error);
        reject(error);
      });
  });
}

export default { sendSMS };
