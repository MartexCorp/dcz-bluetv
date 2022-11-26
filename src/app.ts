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
const allowedDomains = ["http://localhost", "http://localhost:80","http://localhost:8080","http://165.210.33.70","http://165.210.33.70:80","http://165.210.33.70:8080","http://blueviu.camtel.cm","http://blueviu.camtel.cm:80","http://blueviu.camtel.cm:8080","https://blueviu.camtel.cm","https://blueviu.camtel.cm:80","https://blueviu.camtel.cm:8080"]
app.use(cors({
  origin: allowedDomains
}))

/** Logging */
app.use(morgan('dev'));
/** Parse the request */
app.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
app.use(express.json());

app.set('trust proxy', true)

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