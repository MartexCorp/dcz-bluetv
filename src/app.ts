import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes';
import { open } from "sqlite";
import sqlite3 from "sqlite3";
const cors = require("cors");
const signale = require("signale");
signale.config({
  displayFilename: true,
  displayLabel:true,
  displayBadge:true
});


const app: Express = express();
/** Use CORS **/
const allowedDomains = ['http://localhost:8080','http://bluetv.camtel.cm','http://165.210.33.70/']
app.use(cors({
  origin: allowedDomains
}))

/** Logging */
app.use(morgan('dev'));
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