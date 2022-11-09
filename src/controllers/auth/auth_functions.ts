import { Request, Response, NextFunction, request } from "express";
import { AxiosResponse } from "axios";
import { authenticator } from "otplib";
const axios = require("axios").default;
authenticator.options = {digits: 4};
const _secret = "BlueTVKey";


// getting all posts


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
            console.log("✔ SMS Sent | Success: "+ (resultObject)["status"]);
            resolve(resultObject);
            next();
          }).catch((error)=>{
          console.log(error);
          reject(error.message);
        });
      });
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
    if (authenticator.verify({ token: token,secret: _secret})) {
      console.log("✔ User Authenticated");
    } else {
      console.log("✖ Error: User NOT Authenticated");
    }
    resolve(authenticator.verify({ token: token,secret: _secret}));
  });
}

// eslint-disable-next-line no-unused-vars,require-jsdoc
async function generateSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
    resolve(_secret);
    console.log("✔ OTP SecretKey Generated");
    console.log("-->> "+_secret+" <<--");

  });
}

// eslint-disable-next-line require-jsdoc
async function generateToken(secret: string): Promise<object> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    resolve({secret: secret, token: authenticator.generate(secret)});
    console.log("✔ OTP Token Generated");
    // @ts-ignore
    console.log("-->> "+authenticator.generate(secret)+" <<--");

  });
}

// eslint-disable-next-line require-jsdoc,max-len
async function sendAuthSMSToUserPhone(telephone: string, smsBodyText: string, secretToken:object): Promise<object> {
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
          resolve({st: secretToken, status: response.status});
          console.log("-> SMS Request Response Data");
          // @ts-ignore
          console.log(JSON.stringify(response.data));
          console.log("-> Secret-Token Data");
          // @ts-ignore
          console.log(JSON.stringify(secretToken));
        })
        .catch((error: any) => {
          console.log(error);
          reject(error)
        });
  });
}


export default { generateOTP, checkOTP };