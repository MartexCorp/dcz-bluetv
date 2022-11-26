import { NextFunction, Request, Response } from "express";
import { sendSMSToUserPhone } from "../notification/notif_functions";
const xml2js = require("xml2js");
const axios = require("axios").default;
import { AxiosError } from "axios";
const signale = require("signale");

export const activateOffer = function(request: Request, response: Response){
  const _subscriber = request.body.subscriberNumber;
  const _offerID = request.body.offerID;
  signale.info(`Request IP ==> ${request.ip}`)
  ChangeOptionalOffer(_subscriber,_offerID).then((result)=>{
    if(result["resultCode"]==405000000){
      signale.success("Offer Subscription Successful at CRM")
      checkIfCustomerExists(_subscriber).then((isExisting)=>{
        if (!isExisting){
          getSubscriberDetails(_subscriber).then((subscriberObject)=>{
            addCustomerMwareTV(_subscriber,subscriberObject["name"]).then((result)=>{
              sendSMSToUserPhone(_subscriber,`[Pass]:\n Login: ${result["id"]}\n Pass: ${result["pass"]}\n Use this credentials to login to BlueViu App https://play.google.com`).then((smsResultStatus)=>{
                signale.info(`SMS Response Status ${smsResultStatus}`);
                 let statusObject = {subscribeCRM:{ status: true, message: "OK" }, checkExistMWare:{ status: true, message: "OK" }, getSubscriberDetails:{ status: true, message: "OK" }, addCustomerMWare:{ status: true, message: "OK" }, sendSMStoUser:{ status: true, message: "OK" }}
                return response.json(statusObject)
              }).catch((error)=>{
                signale.error("Send SMS to User Error => "+error.response)
                 let statusObject = {subscribeCRM: { status: true, message: "OK" }, checkExistMWare:{ status: true, message: "OK" }, getSubscriberDetails:{ status: true, message: "Subscriber details gotten" }, addCustomerMWare:{ status: true, message: "Customer added on MWareTV" }, sendSMStoUser:{ status: false, message: error.message }}
                return response.json(statusObject)
              })
              signale.success("Offer Subscription Successful on MWareTV");
              signale.note(result);
            }).catch((error)=>{
              signale.error("Add Customer MWareTV Error => "+error.response)
               let statusObject = {subscribeCRM:{ status: true, message: "OK" }, checkExistMWare:{ status: true, message: "OK" }, getSubscriberDetails:{ status: true, message: "OK" }, addCustomerMWare:{ status: false, message: error.message }}
              return response.json(statusObject)
            })
          }).catch((error)=>{
            signale.error("CRM Get Subscriber Details Error => "+error.response)
            let statusObject = {subscribeCRM:{ status: true, message: "OK" }, checkExistMWare:{ status: true, message: "OK" }, getSubscriberDetails: { status: false, message: error.message }}
            return response.json(statusObject)
          })
        }else{
           let statusObject = {subscribeCRM: { status: true, message: "Offer has been successfully activated in the CRM" } , checkExistMWare:{ status: true, message: "User exists in MWareTV Platform" }, smstoUser:{ status: true, message: "Message sending..." }, changeProduct: { status: true, message: "Adding offer extension..." }}
          return response.json(statusObject)
        }
      }).catch((error)=>{
        signale.error("CRM Subscription Error => "+error.response)
         let statusObject = {subscribeCRM:{ status: true, message: "OK" }, checkExistMWare: { status: false, message: error.message }}
        return response.json(statusObject)
      })
    }else{
      signale.error("Offer Subscription went through but was not successful at CRM");
      signale.info(" Result Code -->> "+ result["resultCode"]);
      signale.info(" Result Message -->> "+ result["resultMessage"]);

      let statusObject = {subscribeCRM:{ status: false, message: result["resultMessage"]}}
      return response.json(statusObject)
    }

  }).catch((error)=>{
    signale.error("CRM Subscription Error => "+error)
    let statusObject = {subscribeCRM:{ status: false, message: error.message}}
    return response.json(statusObject)
  })
  //next();
}

async function ChangeOptionalOffer (subscriber:string, offerID:string): Promise<object> {
  signale.info("CRM Change Optional Offer started...")
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
      .then(function(response) {
        signale.info("Optional Offer Axios request sent...")
        // @ts-ignore
        xml2js.parseStringPromise(response.data).then((result: any) => {
          signale.info("Optional Offer Axios request sent...")

          // @ts-ignore
          // eslint-disable-next-line max-len
          const responseCode = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultCode"][0];
          // eslint-disable-next-line max-len
          const responseMessage = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:ChangeOptionalOfferResultMsg"][0]["ResultHeader"][0]["msg:ResultDesc"][0];
          // eslint-disable-next-line max-len

          signale.note(`CRM OfferSubscribe Result Code: ${responseCode}`);
          signale.note(`CRM OfferSubscribe Result Message: ${{ responseMessage }}`)
          resolve({resultCode: responseCode,
            resultMessage: responseMessage});
        }).catch(function(error: any) {
          signale.error("Error has occurred in the AddCustomer Axios Request... "+ error.message)
          reject(error.message);
        });
      });
  });
}

async function addCustomerMwareTV (telephoneNumber, customerName):Promise<object>{
  signale.info("MWare Add Customer started...")
  let fName, mName, lName, mlName:string;
  fName = customerName.toString().split(" ")[0];
  mName = customerName.toString().split(" ")[1];
  lName = customerName.toString().split(" ")[2];
  mlName = mName+" "+lName;
  signale.info(`Names are ${fName} ${mlName}`);
  return new Promise((resolve, reject) => {
    const config = {
      method: "post",
      url: `https://camtel.mytvapp.tv/api/AddCustomer/addCustomer?productid=1&subscriptionlengthinmonths=1&cmsService=Content&crmService=Camtel_CRM&reseller_id=0&order_id=0&authToken=594c6fde-8f9f-4093-93f1-53238fbc73e0&StartSubscriptionFromFirstLogin=true&sendMail=false&firstname=${fName}&lastname=${mlName}&street=Happy2000&zipcode=13062&city=Yaounde&state=CE&country=Cameroon&phone=+237${telephoneNumber}&mobile=0&email=${telephoneNumber}@camtel.cm&userid=${telephoneNumber}&sendSMS=false`,
      headers: {}
    };

    axios(config)
      .then(function (response) {
        // @ts-ignore
        // console.log(JSON.stringify(response.data));
        if (response.status==200){
          const credentialsJSON = JSON.parse(response.data.toString().replace(/\\/g, ""));
          let id = credentialsJSON["loginid"];
          let pass = credentialsJSON["password"];
          if (id!=null && pass!=null){
            signale.success("Successfully retrieved Login and Pass from MWareTV");
            signale.note("MWareTv Id: "+ id);
            signale.note("MWareTV Pass: "+ pass)
            signale.note("MWareTV Customer Name "+ customerName)
            resolve({id: credentialsJSON["loginid"], pass: credentialsJSON["password"]});
          }else{
            signale.warn("ID and Pass not found")
            reject({status: false, message:"ID and Pass not found" })
          }
        }else{
          signale.warn("Response status code is "+response.status)
          signale.info("Response message is "+ response.data)
          reject({status: false, message:response.data })
        }

      })
      .catch(function (error) {
        signale.error("Error has occurred in the AddCustomer Axios Request... "+ error.message)
        reject(error.message);
      });

  })
}

async function checkIfCustomerExists (telephoneNumber):Promise<boolean>{
  signale.info("Check if Customer exists in MWare started...")
  return new Promise((resolve) => {
    const config = {
      method: 'get',
      url: `https://camtel.mytvapp.tv/api/GetCustomer/getCustomer?customermappingid=&userid=${telephoneNumber}&crmService=Camtel_CRM&authToken=594c6fde-8f9f-4093-93f1-53238fbc73e0&cmsService=Content`,
      headers: { }
    };
    axios(config)
      .then(function (response) {
        // @ts-ignore
        signale.info("Response Data =>> "+response.status);
        const parseResponse = JSON.parse(response.data.toString().replace(/\\/g, ""));
        let fName = parseResponse["firstname"];
        let lName = parseResponse["lastname"];
        let id = parseResponse["userid"];
        let pass = parseResponse["password"];
        signale.info("User already exists... Re-transmitting details to existing User");
        sendSMSToUserPhone(id,`[Customer]: Existing User\nLogin: ${id}\n Pass: ${pass}\n Names: ${fName} ${lName}\n Use these credentials to login to BlueViu App https://play.google.com`).then((smsResultStatus)=>{
          signale.info(`SMS Response Status ${smsResultStatus}`);
          resolve(true);
          changeCustomerProduct(id,pass).then((result)=>{
            signale.info(result)
            }
          ).catch((reason)=>{
            signale.error(reason.message)
          })
        });
      })
      .catch((reason: AxiosError) => {
        if (reason.response?.status == 404) {
          // Handle 404
          signale.error("User does not exist on MWare Platform... Create new User")
          resolve(false);
        } else {
          signale.error("Some Other error...")
        }
        signale.error(reason.message)
      })

  })
}

async function changeCustomerProduct (telephoneNumber,pass):Promise<object>{
  signale.info("Change Customer Product started...")
  return new Promise((resolve, reject) => {
    var config = {
      method: 'post',
      url: `https://camtel.mytvapp.tv/api/ChangeCustomerProduct/changeCustomerProduct?productid=1&subscriptionlengthinmonths=0&subscriptionlengthindays=30&cmsService=Content&crmService=Camtel_CRM&userid=${telephoneNumber}&password=${pass}&fromExpireDate=false&authToken=594c6fde-8f9f-4093-93f1-53238fbc73e0`,
      headers: { }
    };
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (reason) {
    if (reason.response?.status == 400) {
          // Handle 400
          signale.info("User does not exist on MWare Platform... Check Credentials")
        } else {
          signale.error("Some Other error...")
        }
        signale.error(reason.message)
        reject(reason);
      });
  })
}

export const getCRMSubscriberDetails = async function(request: Request, response: Response) {
  const _subscriber = request.body.number;
  const name = await getSubscriberDetails(_subscriber).then(result => signale.info(result["name"]))
  await addCustomerMwareTV(_subscriber, name).then((result)=>{
    signale.info(result.toString())
  })
}
async function  getSubscriberDetails (telephoneNumber):Promise<object> {
  signale.info("Getting Subscriber details started...")
  return new Promise((resolve, reject) => {
    const data = "<soap:Envelope xmlns:soap=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:msg=\"http://oss.huawei.com/business/intf/webservice/query/msg\">\n   <soap:Header/>\n   <soap:Body>\n      <msg:QuerySubscriberRequestMsg>\n         <RequestHeader>\n         </RequestHeader>\n         <QuerySubscriberRequest>\n            <msg:QueryType>0</msg:QueryType>\n            <msg:Value>" + telephoneNumber + "</msg:Value>\n         </QuerySubscriberRequest>\n      </msg:QuerySubscriberRequestMsg>\n   </soap:Body>\n</soap:Envelope>";

    const config = {
      method: "post",
      url: "http://192.168.240.7:8280/services/FullQueryCustomer.FullQueryCustomerHttpSoap12Endpoint",
      headers: {
        "Content-Type": "application/soap+xml",
        "SOAPAction": "querySubscriber"
      },
      data: data
    };

    axios(config)
      .then(function(response) {
        signale.info("Get Subscriber Details request sent...")
        // @ts-ignore
        xml2js.parseStringPromise(response.data).then((result: any) => {
          // @ts-ignore
          // eslint-disable-next-line max-len
          const responseCode = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:QuerySubscriberResponseMsg"][0]["ResultHeader"][0]["msg:ResultCode"][0];
          const responseMessage = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:QuerySubscriberResponseMsg"][0]["ResultHeader"][0]["msg:ResultDesc"][0];
          const subscriberName = result["soapenv:Envelope"]["soapenv:Body"][0]["msg:QuerySubscriberResponseMsg"][0]["QuerySubscriberResponse"][0]["msg:Customer"][0]["msg:CustomerName"][0];

          // eslint-disable-next-line max-len
          signale.success("Subscriber details queried and receive successfully")
          resolve(
            {code: responseCode,
              message: responseMessage,
              name: subscriberName}
          )
        })
      }).catch((error)=>{
      signale.error("Error has occurred in the QuerySubscriber Axios Request... "+ error.message);
      reject(error)
    })
  })
}



export default { activateOffer, getCRMSubscriberDetails };