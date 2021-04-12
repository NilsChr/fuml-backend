import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";
import { apiRoutes } from "./routeRegistry";
import customerController from "../controllers/customer/customer.controller";

export default ({ app }: TRoutesInput) => {
  /**
   * Get account
   */
  app.get(
    "/api/account",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const user = req.user;
      const customer = await customerController.GetByUserId(user._id);

      const data = {
        user,
        customer
      }
      logRes(200, data);
      res.status(200).send(data);
    }
  );

  /**
   * Get User by Id
   */
  app.get(
    apiRoutes.users +"/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedUser = await userController.GetById(req.params.id);
      if (!requestedUser._id.equals(req.user._id)) {
        return res.status(403).send();
      }
      logRes(200, requestedUser);
      return res.status(200).send(requestedUser);
    }
  );

  /**
   * Update User
   */
  app.put(
    apiRoutes.users + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedUser = await userController.GetById(req.params.id);
        if (!requestedUser._id.equals(req.user._id)) {
          return res.status(403).send();
        }
        const updates = req.body;

        const updatedUser = await userController.Update(requestedUser, updates);
        logRes(200, updatedUser);
        return res.status(200).send(updatedUser);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Delete User
   */
  app.delete(apiRoutes.users + "/:id", logReq,checkIfAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const requestedUser = await userController.GetById(req.params.id);
      if (!requestedUser._id.equals(req.user._id)) {
        return res.status(403).send();
      }
      const deletedUser = await userController.Delete(requestedUser._id);
      logRes(200, deletedUser);
      return res.status(200).send(deletedUser);
    } catch (e) {
      console.log(e);
      res.status(500).send();
    }
  });
};
