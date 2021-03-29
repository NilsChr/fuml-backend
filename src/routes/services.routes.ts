import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";

export default ({ app }: TRoutesInput) => {
  let base = "/api/services";

  /**
   * Get users by nickname
   */
  app.post(
    base + "/usersearch",
    logReq,
    async (req: any, res: any, next: any) => {
      const userNameSearch = req.body.search;
      console.log(userNameSearch)
      if(userNameSearch == '') {
        res.status(200).send([]);
      }
      const users = await userController.GetByNickname(userNameSearch);
        console.log('SEARCH', users);
      //  const user = req.user;
      logRes(200, users);
      res.status(200).send(users);
    }
  );


};
