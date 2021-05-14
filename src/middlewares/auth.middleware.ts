import firebase from "firebase-admin";
import UserController from "../controllers/user.controller";

firebase.initializeApp({
  credential: firebase.credential.applicationDefault(),
  databaseURL: "https://bogsynth.firebaseio.com",
});

const getAuthToken = (req: any, res: any, next: any) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    req.authToken = req.headers.authorization.split(" ")[1];
  } else {
    req.authToken = null;
  }
  next();
};

const checkIfAuthenticated = (req: any, res: any, next: any) => {
  getAuthToken(req, res, async () => {
    //console.log("middleware: checkIfAuthenticated");
    try {
      const test = process.env.NODE_ENV === "development" ? "_test" : "";
      let userInfo: any = {
        email: null,
        uid: null,
      };
      const { authToken } = req;
      userInfo = await firebase.auth().verifyIdToken(authToken);
      req.googleId = userInfo.uid;
      req.userName = userInfo.userName;

      try {
        req.user = await UserController.GetByEmail(userInfo.email);
        //console.log(req.user);
        if (!req.user) throw "no user found";
        //console.log("Found user");
      } catch (e) {
        //console.log("Creating new user");
        req.user = await UserController.Create({
          nickName: userInfo.name,
          avatarUrl: userInfo.picture,
          email: userInfo.email,
          googleId: userInfo.uid,
          isAdmin: false,
          projects: [],
          created: new Date().getTime(),
          selectedTheme: 2
        });
      }

      //console.log("user found: ", req.user);
      return next();
    } catch (e) {
      console.log(e);
      return res
        .status(403)
        .send({ error: "You are not authorized to make this request" });
    }
  });
};

export { checkIfAuthenticated };
