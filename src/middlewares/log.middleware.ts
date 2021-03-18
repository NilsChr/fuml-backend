const logReq = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  // console.log(req);
  console.log("--------Incoming Request---------");
  // console.log(req._parsedUrl.path);

  console.log(req.method + ": " + req._parsedUrl.path);
  return next();
};

const logRes = (statusCode: number, body: any) => {
  if (process.env.NODE_ENV === "development") {
    return;
  }
  console.log(">>>>>>Response");
  console.log("Status: ", statusCode);
  console.log("Body: ", body);
};

export { logReq, logRes };
