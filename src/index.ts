const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
});

import express, { Request, Response, Application } from "express";
import bodyParser from "body-parser";
import connect from "./connect";
import cors from "cors";

import userRoutes from "./routes/user.routes";


const app: Application = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json( {limit: '100mb'}));
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


const fileUpload = require('express-fileupload');
app.use(fileUpload({
    createParentPath: true
}));


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
  res.send("Welcome to the Mongoose & TypeScript example")
);

export const server = app.listen(port, () =>
  console.log(`Application started successfully on port ${port}.`)
);

if(process.env.NODE_ENV === 'production') {
  const db = process.env.DB_URI;
  connect({ db });
}

userRoutes({app});

export default app;