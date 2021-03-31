import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";
import { apiRoutes } from "./routeRegistry";

export default ({ app }: TRoutesInput) => {

  /**
   * Get users by nickname
   */
  app.post(
    apiRoutes.services + "/usersearch",
    logReq,
    async (req: any, res: any, next: any) => {
      const userNameSearch = req.body.search;
      if(userNameSearch == '') {
        res.status(200).send([]);
      }
      const users = await userController.GetByNickname(userNameSearch);
      //  const user = req.user;
      logRes(200, users);
      res.status(200).send(users);
    }
  );


};
