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
      const requestedUser = await userController.GetByGoogleId(req.params.id);
      if (requestedUser.googleId != req.googleId) {
        return res.status(403);
      }
      logRes(200, requestedUser);
      res.status(200).send(requestedUser);
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
      console.log("PUT: " + base);
      /*try {
      const id = req.params.id;
      const { title, publicSong, genres } = <ISong>req.body;

      const user = await userController.GetUserByGoogleId(req.googleId);
      const song = await songController.GetSongById(id);

      if(!song.ownerId.equals(user._id)) {
        return res.status(403).send();
      }
      const genre = await songController.UpdateSong(<ISong>{ id, title, publicSong, genres });
      res.status(200).send(genre);
    } catch (e) {
      console.log(e);
      res.status(500).send();
    }
    */
    }
  );

  /**
   * Delete User
   */
  app.delete(base + "/:id", logReq, async (req: any, res: any, next: any) => {
    console.log("DELETE: " + base);
    /*try {
      const id = req.params.id;
      const user = await userController.GetUserByGoogleId(req.googleId);
      const song = await songController.GetSongById(id);
      if(!song.ownerId.equals(user._id)) {
        return res.status(403).send();
      }

      await songController.DeleteSong(id);

      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(500).send();
    }
    */
  });
};
