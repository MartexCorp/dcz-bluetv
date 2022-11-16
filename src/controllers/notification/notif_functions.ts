import { NextFunction, Request, Response } from "express";
import { checkOTP, generateOTP } from "../auth/auth_functions";

const axios = require("axios").default;
const signale = require("signale");


export async function sendSMSToUserPhone(telephone: string, smsBodyText: string): Promise<object> {
  signale.info("Send SMS started...")
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
      data : data
    };

    axios(config)
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

export default { sendSMSToUserPhone };
