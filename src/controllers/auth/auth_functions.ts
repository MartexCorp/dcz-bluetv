import { NextFunction, Request, Response } from "express";
import { totp } from "otplib";
import { HashAlgorithms } from "@otplib/core";
const axios = require("axios").default;
const signale = require("signale");
const crypto = require("crypto")
totp.options = {digits: 6, step: 300};// step (s) 60*5




export const generateOTP = function(request: Request, response: Response, next: NextFunction): Promise<object> {
  let telephoneNumber: string = request.body.telephone;
  return new Promise(function(resolve, reject) {
    generateSecret(telephoneNumber).then((secret)=> {
      generateToken(secret).then((secretToken) => {
        sendAuthSMSToUserPhone(telephoneNumber,
          // eslint-disable-next-line max-len
          "[Auth]: " + "Verification code: " + (secretToken)["token"] + ". DO NOT share this code with ANYONE", secretToken)
          // eslint-disable-next-line max-len
          .then((resultObject)=>{
            signale.success("SMS Sent | Success: "+ (resultObject)["status"]);
            resolve(resultObject);
            next(resultObject);
          }).catch((error)=>{
          signale.error("Error in SMS Auth Promise..."+error)
          next(error);
        });
      }).catch((error)=>{
        signale.error("Error in Generate Token Promise..."+error)
      });
    }).catch((error)=>{
      signale.error("Error in Generate Secret Promise..."+error)
    });
  });
};

export const checkOTP = function(request: Request, response: Response ) {
  const _token = request.body.token;
  const _number = request.body.number;
  const _secret = crypto.createHash("md5").update(_number).digest("hex")
  isAuthenticated(_secret,_token).then((isValid)=>{
    return response.status(200).json({
      authed: isValid,
      left: totp.timeRemaining(),
      used: totp.timeUsed()

    });
  });
}

async function isAuthenticated(secret: string, token:string): Promise<boolean> {

  return new Promise(function(resolve) {
    // @ts-ignore
    if (totp.check( token, secret )) {
      signale.success("User Authenticated");
    } else {
      signale.error("Error: User NOT Authenticated");
    }
    resolve(totp.check( token, secret ));
  });
}
// eslint-disable-next-line no-unused-vars,require-jsdoc
async function generateSecret(telephoneNumber:string): Promise<string> {
  return new Promise((resolve, reject) => {
    const _secret = crypto.createHash("md5").update(telephoneNumber).digest("hex")
    resolve(_secret);
    signale.success("OTP SecretKey Generated");
    signale.note("-->> "+_secret+" <<--");

  });
}

// eslint-disable-next-line require-jsdoc
async function generateToken(secret: string): Promise<object> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    resolve({secret: secret, token: totp.generate(secret)});
    signale.success("OTP Token Generated");
    signale.note("-->> "+totp.generate(secret)+" <<--");
    signale.note(`Time Remaining: ${totp.timeRemaining()}`);


  });
}

// eslint-disable-next-line require-jsdoc,max-len
async function sendAuthSMSToUserPhone(telephone: string, smsBodyText: string, secretToken:object): Promise<object> {
  signale.info("Sending Auth SMS to User started...")
  return new Promise((resolve, reject) => {
      // @ts-ignore
      const data = JSON.stringify({
        "recipient": "+237" + telephone,
        "text": smsBodyText,
      });
      var config = {
        method: "get",
        url: "http://172.20.24.77:9501/api?action=sendmessage&username=mwaretv&password=mwaretv1234&recipient=237"+telephone+"&messagetype=SMS:TEXT&messagedata="+smsBodyText,
        headers: { }
      };
      axios.request(config)
        .then((response:any)=>{
          if(response.status==200){
            signale.success("SMS sent to user successfully")
            signale.note("Secret Token: "+ secretToken)
            resolve({st: secretToken, status: response.status});
          }else{
            signale.warn("SMS API response code is "+ response.status)
          }
        })
        .catch((error: any) => {
          signale.error(error.message)
          reject(error.message)
        });
  });
}


export default { generateOTP, checkOTP };