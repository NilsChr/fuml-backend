import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import projectController from "../controllers/project.controller";
import { IProjectDTO } from "../models/project.model";
import sequenceDocumentController from "../controllers/sequenceDocument.controller";
import entityDocumentController from "../controllers/entityDocument.controller";
import { apiRoutes } from "./routeRegistry";
import kanbanBoardController from "../controllers/kanban/kanbanBoard.controller";

export default ({ app }: TRoutesInput) => {

  /**
   * Post Projects
   */
  app.post(
    apiRoutes.projects,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        if (!req.body.title || req.body.title == "") {
          res.status(400).send();
        }

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
    apiRoutes.projects,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const projects = await projectController.GetForCollaborator(req.user._id);
      logRes(200, projects);
      return res.status(200).send(projects);
    }
  );

  /**
   * Get Project by Id
   */
  app.get(
    apiRoutes.projects + "/:id",
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
   * Get Project documents
   */
   app.get(
    apiRoutes.projects + "/:id/documents",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }

      let documents = [];
      for(let i = 0; i < requestedProject.sequenceDocuments.length; i++) {
        const docId = requestedProject.sequenceDocuments[i];
        const doc = await sequenceDocumentController.GetById(docId);
        if(!doc) continue;
        documents.push(doc);
      }

      for(let i = 0; i < requestedProject.entityDocuments.length; i++) {
        const docId = requestedProject.entityDocuments[i];
        const doc = await entityDocumentController.GetById(docId);
        if(!doc) continue;
        documents.push(doc);
      }

      logRes(200, documents);
      return res.status(200).send(documents);
    }
  );

  /**
   * Get Project boards
   */
   app.get(
    apiRoutes.projects + "/:id/boards",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedProject = await projectController.GetById(req.params.id);
      if (!requestedProject.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }
      const boards = await kanbanBoardController.GetAllProjectBoards(requestedProject._id)
      logRes(200, boards);
      return res.status(200).send(boards);
    }
  );

  /**
   * Update Project
   */
  app.put(
    apiRoutes.projects + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedProject = await projectController.GetById(req.params.id);

        if(!requestedProject) {
          return res.status(404).send();
        }

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
    apiRoutes.projects + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedProject = await projectController.GetById(req.params.id);
        
        if(!requestedProject) {
          return res.status(404).send();
        }

        if (!requestedProject.ownerId.equals(req.user._id)) {
          return res.status(403).send();
        }
        const deletedProject = await projectController.Delete(
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
