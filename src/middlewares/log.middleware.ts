import logger from "../config/winston";

const logReq = (req: any, res: any, next: any) => {
  return next();
  /*if (process.env.NODE_ENV === "development") {
    return next();
  }*/

  // console.log(req);
  //console.log("--------Incoming Request---------");
  // console.log(req._parsedUrl.path);
  logger.info("--------Incoming Request---------");
  //console.log(req.method + ": " + req._parsedUrl.path);
  logger.info(req.method + ": " + req._parsedUrl.path);

  return next();
};

const logRes = (statusCode: number, body: any) => {
  return;
  /*if (process.env.NODE_ENV === "development") {
    return;
  }*/
  //console.log(">>>>>>Response");
  //console.log("Status: ", statusCode);
  //console.log("Body: ", body);

  logger.info(">>>>>>Response");
  logger.info("Status: " + statusCode);
  logger.info("Body: " + body);
};

export { logReq, logRes };
