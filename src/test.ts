import { Request, Response } from "express";
import { activateOffer } from "./controllers/activation/activation_functions";

export const singularTest = async function(request: Request, response: Response) {
  const _subscriber = request.body.number;

}

export default { singularTest };