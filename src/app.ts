import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes';

const router: Express = express();

/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

// @ts-ignore
// @ts-ignore
/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header('Access-Control-Allow-Origin', '*');
  // set the CORS headers
  res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
  // set the CORS method headers
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
    return res.status(200).json({});
  }
  next();
});

/** Routes */
router.use('/', routes);

/** Successfully Connected to Backend */
router.use((req, res, next) => {
  const message = ("Connected Sucessfully. Use Postman to Get Response");
  return res.status(200).send(message);
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 9173;
httpServer.listen(PORT, () => console.log("The server is running on port "+`${PORT}`));