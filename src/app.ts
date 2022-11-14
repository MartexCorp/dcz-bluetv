import http from "http";
import express, { Express } from "express";
import routes from "./routes";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
const cors = require("cors");


const router: Express = express();
/** Use CORS **/
router.use(cors());
router.use(
  cors({
    origin: true})
);
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

// @ts-ignore
// @ts-ignore
/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*");
  // set the CORS headers
  res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");
  // set the CORS method headers
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
    return res.status(200).json({});
  }
  next();
});

open({
  filename: "/tmp/database.db",
  driver: sqlite3.Database
}).then(async (db) => {
  // do your thing
});

/** Routes */
router.use("/", routes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message
  });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 9173;
httpServer.listen(PORT, () => console.log("The server is running on port " + `${PORT}`));