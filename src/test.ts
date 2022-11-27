import { Request, Response } from "express";
import { activateOffer} from "./controllers/activation/activation_functions";
const tcpp = require("tcp-ping");
const signale = require("signale");



export const singularTest =  function(request: Request, response: Response) {
  const _param = request.body.telephone;


}

function pingTest(_host){
  let result1:string, result2:string;
  // eslint-disable-next-line no-unused-vars
  tcpp.probe(_host, 8280, function(err: any, available: any) {
    const message1 = "Host "+ _host +" is Availabale: "+available+"\n";
    console.log(message1);
    result1 = message1;
  });

  tcpp.ping({address: _host, port: 8280}, function(err: any, data: any) {
    console.log(data);
    // eslint-disable-next-line max-len
    const message2 = "Pinging "+ data.address +" Port: "+data.port+ " with "+data.attempts+" packets \n"+ JSON.stringify(data.results);
    console.log(message2);
    result2 = message2;

  })
}

export default { singularTest };