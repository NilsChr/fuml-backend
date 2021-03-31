import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";
import projectController from "../controllers/project.controller";
import { apiRoutes } from "./routeRegistry";

export default ({ app }: TRoutesInput) => {

  /**
   * Post Project collaborators
   */
  app.post(
    apiRoutes.projects + "/:id/collaborators",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.ownerId.equals(req.user._id)) {
        return res.status(403).send();
      }

      const newCollaboratorId = req.body._id;
      if (!newCollaboratorId) {
        return res.status(400).send();
      }
      const user = await userController.GetById(newCollaboratorId);
      if (!user) {
        return res.status(404).send();
      }

      await projectController.AddCollaborator(user, requestedProject);

      logRes(201, requestedProject.collaborators);
      return res.status(201).send(requestedProject.collaborators);
    }
  );

  /**
   * Get Project collaborators
   */
  app.get(
    apiRoutes.projects + "/:id/collaborators",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }

      let users = [];
      for (let i = 0; i < requestedProject.collaborators.length; i++) {
        const user = await userController.GetById(
          requestedProject.collaborators[i]
        );
        users.push(user);
      }

      let sanitizedUsers = users.map((u) => {
        return {
          _id: u._id,
          avatarUrl: u.avatarUrl,
          nickName: u.nickName,
        };
      });

      logRes(200, sanitizedUsers);
      return res.status(200).send(sanitizedUsers);
    }
  );

  /**
   * Delete Project collaborators
   */
  app.delete(
    apiRoutes.projects + "/:id/collaborators/:collaboratorId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.ownerId.equals(req.user._id)) {
        return res.status(403).send();
      }

      const removeCollaboratorId = req.params.collaboratorId;
      if (!removeCollaboratorId) {
        return res.status(400).send();
      }
      const user = await userController.GetById(removeCollaboratorId);
      if (!user) {
        return res.status(404).send();
      }

      const updatedProject = await projectController.RemoveCollaborator(
        user,
        requestedProject
      );

      logRes(200, updatedProject.collaborators);
      return res.status(200).send(updatedProject.collaborators);
    }
  );
};
