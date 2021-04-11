


const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

import express, { Request, Response, Application } from "express";
import bodyParser from "body-parser";
import connect from "./connect";
import cors from "cors";

import apicache from 'apicache';
import routeRegistry from "./routes/routeRegistry";
const helmet = require("helmet");


const app: Application = express();
app.use(helmet());
const port = process.env.PORT || 8080;

const httpLogger = require('./middlewares/logger.middleware');
import logger from "./config/winston";
app.use(httpLogger);

app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cors());
app.options('*', cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Authorization");
  next();
});

app.get("/", (req: Request, res: Response) =>
  res.send("Welcome to fuml. Api at /api/")
);

export const server = app.listen(port, () => {
  logger.info(`Application started successfully on port ${port}.`)
});

if(process.env.NODE_ENV !== 'test') {
  const db = process.env.DB_URI;
  connect({ db });
}

routeRegistry({app});

export default app;