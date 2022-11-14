import http from "http";
import express, { Express } from "express";
import routes from "./routes";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
const cors = require("cors");


const app: Express = express();
/** Use CORS **/
app.use(cors({
  origin: "http://localhost:8080"
}))

/** Parse the request */
app.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
app.use(express.json());

// @ts-ignore
// @ts-ignore
/** RULES OF OUR API */

open({
  filename: "/tmp/database.db",
  driver: sqlite3.Database
}).then(async (db) => {
  // do your thing
});

/** Routes */
app.use("/", routes);

/** Error handling */
app.use((req, res, next) => {
  const error = new Error("not found");
  return res.status(404).json({
    message: error.message
  });
});

/** Server */
const httpServer = http.createServer(app);
const PORT: any = process.env.PORT ?? 9173;
httpServer.listen(PORT, () => console.log("The server is running on port " + `${PORT}`));