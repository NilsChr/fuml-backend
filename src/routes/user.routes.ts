import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";

export default ({ app }: TRoutesInput) => {
  let base = "/api/users";

  /**
   * Get account
   */
  app.get(
    "/api/account",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const user = req.user;
      logRes(200, user);
      res.status(200).send(user);
    }
  );

  /**
   * Get User by Id
   */
  app.get(
    "/api/users/:id",
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
    base + "/:id",
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
        res.status(500).send();
      }
    }
  );

  /**
   * Delete User
   */
  app.delete(base + "/:id", logReq, async (req: any, res: any, next: any) => {
    console.log("DELETE: " + base);
    try {
      const requestedUser = await userController.GetById(req.params.id);
      if (!requestedUser._id.equals(req.user._id)) {
        return res.status(403).send();
      }
      const deletedUser = await userController.Delete(requestedUser._id);
      logRes(200, deletedUser);
      return res.status(200).send(deletedUser);
    } catch (e) {
      res.status(500).send();
    }
  });
};
