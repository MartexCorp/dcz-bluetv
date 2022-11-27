import { Request, Response } from "express";
import { activateOffer } from "./controllers/activation/activation_functions";
const tcpp = require("tcp-ping");


export const singularTest =  function(request: Request, response: Response) {
  const host = "192.168.240.7";
  // eslint-disable-next-line no-unused-vars
  tcpp.probe(host, 8280, function(err: any, available: any) {
    const message1 = "Host "+ host +" is Availabale: "+available+"\n";
    console.log(message1);
  });

  tcpp.ping({address: host, port: 8280}, function(err: any, data: any) {
    console.log(data);
    // eslint-disable-next-line max-len
    const message2 = "Pinging "+ data.address +" Port: "+data.port+ " with "+data.attempts+" packets \n"+ JSON.stringify(data.results);
    console.log(message2);

})
}

export default { singularTest };