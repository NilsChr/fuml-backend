import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import userController from "../controllers/user.controller";
import projectController from "../controllers/project.controller";
import { IProjectDTO } from "../models/project.model";

export default ({ app }: TRoutesInput) => {
  let base = "/api/projects";

  /**
   * Post Projects
   */
  app.post(
    base,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const projectData: IProjectDTO = {
          title: req.body.title,
          entityDocuments: [],
          sequenceDocuments: [],
          ownerId: req.user._id,
          created: new Date().getTime(),
          collaborators: [],
        };
        const newProject = await projectController.Create(projectData);
        res.status(201).send(newProject);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Projects
   */
  app.get(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }
      logRes(200, requestedProject);
      return res.status(200).send(requestedProject);
    }
  );

  /**
   * Get Project by Id
   */
  app.get(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }
      logRes(200, requestedProject);
      return res.status(200).send(requestedProject);
    }
  );

  /**
   * Update Project
   */
  app.put(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedProject = await projectController.GetById(req.params.id);
        if (!requestedProject.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
        const updates = req.body;

        const updatedProject = await projectController.Update(
          requestedProject,
          updates
        );
        logRes(200, updatedProject);
        return res.status(200).send(updatedProject);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Project
   */
  app.delete(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      console.log("DELETE: " + base);
      try {
        const requestedProject = await projectController.GetById(req.params.id);
        if (!requestedProject.ownerId.equals(req.user._id)) {
          return res.status(403).send();
        }
        const deletedProject = await userController.Delete(
          requestedProject._id
        );
        logRes(200, deletedProject);
        return res.status(200).send(deletedProject);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
};
