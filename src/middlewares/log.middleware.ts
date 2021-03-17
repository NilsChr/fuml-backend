const logReq = (req: any, res: any, next: any) => {
    // console.log(req);
   console.log("--------Incoming Request---------");
  // console.log(req._parsedUrl.path);
 
   console.log(req.method + ": " +req._parsedUrl.path);
   return next();
 };
 
 const _logRes = (req: any, res: any, next: any) => {
   console.log("--------Response---------");
   console.log("Status: ", res);
   console.log("Body: ", res.body);
 
   return next();
 };
 
 const logRes = (statusCode: number, body: any) => {
     console.log(">>>>>>Response");
     console.log("Status: ", statusCode);
     console.log("Body: ", body);
 }
 
 export { logReq, logRes };
 