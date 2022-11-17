import { NextFunction, Request, Response } from "express";
import { totp } from "otplib";
import { HashAlgorithms } from "@otplib/core";
import { sendSMSToUserPhone } from "../notification/notif_functions";
const axios = require("axios").default;
const signale = require("signale");
const crypto = require("crypto")
totp.options = {digits: 6, step: 300};// step (s) 60*5




export const generateOTP = function(request: Request, response: Response, next: NextFunction): Promise<object> {
  let telephoneNumber: string = request.body.telephone;
  return new Promise(function(resolve, reject) {
    generateSecret(telephoneNumber).then((secret)=> {
      generateToken(secret).then((secretTokenObject) => {
        sendAuthSMSToUserPhone(telephoneNumber,
          // eslint-disable-next-line max-len
          "[Auth]: " + "Verification code: " + (secretTokenObject)["token"] + ". DO NOT share this code with ANYONE", secretTokenObject)
          // eslint-disable-next-line max-len
          .then((resultStatus)=>{
            signale.success("SMS Sent | Success: "+ resultStatus);
            let statusObject = {secret:"OK", token: "OK", sms:"OK"}
            resolve(statusObject);
            return response.status(200).json(statusObject)
          }).catch((error)=>{
          signale.error("Error in SMS Auth Promise..."+error)
          let statusObject = {secret:"OK", token: "OK", sms:error.message}
          return response.json(statusObject)
        });
      }).catch((error)=>{
        signale.error("Error in Generate Token Promise..."+error)
        let statusObject = {secret:"OK", token:error.message}
        return response.json(statusObject)
      });
    }).catch((error)=>{
      signale.error("Error in Generate Secret Promise..."+error)
      let statusObject = {secret:error.message}
      return response.json(statusObject)
    });
  });
};

export const checkOTP = function(request: Request, response: Response ) {
  const _token = request.body.token;
  const _number = request.body.number;
  const _secret = crypto.createHash("md5").update(_number).digest("hex")
  isAuthenticated(_secret,_token).then((isValid)=>{
    signale.note(`Secret is ${_secret}, Token is ${_token}, Number is ${_number} and Authed is ${isValid}`)
    return response.status(200).json({
      authed: isValid,
      left: totp.timeRemaining(),
      used: totp.timeUsed(),
      token: _token,
      number: _number,
      secret: _secret
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
async function sendAuthSMSToUserPhone(telephone: string, smsBodyText: string, secretTokenObject:object):Promise<number> {
  return new Promise((resolve, reject) => {
    signale.info("Sending Auth SMS to User started...")
    sendSMSToUserPhone(telephone,smsBodyText).then((SMSResponseStatus)=>{
      signale.success(`SMS Response status = ${SMSResponseStatus["status"]}`)
      resolve(SMSResponseStatus["status"]);
    }).catch((error)=>{
      signale.error("Error in SendAuthSMSToUserPhone Promise...")
      reject(error);
    })
  })
}


export default { generateOTP, checkOTP };