import { Request, Response, NextFunction, request } from "express";
import { AxiosResponse } from "axios";
import { totp } from "otplib";
const axios = require("axios").default;
const signale = require("signale");
totp.options = {digits: 6,epoch: 1024};
let _secret = "BlueTVKey";



export const generateOTP = function(request: Request, response: Response, next: NextFunction): Promise<object> {
  let telephoneNumber: string = request.body.telephone;
  return new Promise(function(resolve, reject) {
    generateSecret().then((secret)=> {
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
  isAuthenticated(_token).then((isValid)=>{
    return response.status(200).json({
      authed:isValid
    })
  });
}

async function isAuthenticated(token:string): Promise<boolean> {

  return new Promise(function(resolve) {
    // @ts-ignore
    if (totp.verify({ token: token,secret: _secret})) {
      console.log("✔ User Authenticated");
    } else {
      console.log("✖ Error: User NOT Authenticated");
    }
    resolve(totp.verify({ token: token,secret: _secret}));
  });
}

// eslint-disable-next-line no-unused-vars,require-jsdoc
async function generateSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
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