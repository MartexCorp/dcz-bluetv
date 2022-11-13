import { NextFunction, Request, Response } from "express";
import { checkOTP, generateOTP } from "../auth/auth_functions";

const axios = require("axios").default;
const signale = require("signale");



export const sendSMS = function(request: Request, response: Response) {
  const _subscriber = request.body.subscriberNumber;
  const _message = request.body.message;

  sendSMSToUserPhone(_subscriber, _message).then((result) => {
    return response.status(200).json({
      result: result
    });
  });
};

export async function sendSMSToUserPhone(telephone: string, smsBodyText: string): Promise<object> {
  signale.info("Send SMS started...")
  return new Promise((resolve, reject) => {
    // @ts-ignore
    var config = {
      method: "get",
      url: "http://172.20.24.77:9501/api?action=sendmessage&username=mwaretv&password=mwaretv1234&recipient=237" + telephone + "&messagetype=SMS:TEXT&messagedata=" + smsBodyText,
      headers: {}
    };
    axios.request(config)
      .then((response: any) => {
        if(response.status == 200){
          signale.success("SMS successfully sent")        // @ts-ignore
          resolve({ status: response.status });
        }else{
          signale.warn("SMS status returns code "+ response.status+". Please check your messaging API.")
        }
      })
      .catch((error: any) => {
        signale.error("SMS Sending Axios Request error... "+ error.message)
        reject(error.message);
      });
  });
}

export default { sendSMS };
