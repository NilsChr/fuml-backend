import { TRoutesInput } from "../../types/routes";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import { logReq, logRes } from "../../middlewares/log.middleware";
import projectController from "../../controllers/project.controller";
import { IProjectDTO } from "../../models/project.model";
import { IKanbanBoardContructor } from "../../models/kanban/kanbanBoard.model";
import kanbanBoardController from "../../controllers/kanban/kanbanBoard.controller";
import { apiRoutes } from "../routeRegistry";

export default ({ app }: TRoutesInput) => {

  /**
   * Post KanbanBoard
   */
  app.post(
    apiRoutes.kanbanboards,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const project = await projectController.GetById(req.body.projectId);
        if (!project) {
          return res.status(404).send();
        }
        const kanbanBoard: IKanbanBoardContructor = {
          projectId: project._id,
          ownerId: req.user._id,
          title: req.body.title,
          backgroundColor: req.body.backgroundColor,
          private: req.body.private,
        };
        const newBoard = await kanbanBoardController.Create(kanbanBoard);
        res.status(201).send(newBoard);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Entity Document
   */
  /*
  app.get(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedDocument = await entityDocumentController.GetById(
        req.params.id
      );
      if (!requestedDocument) {
        return res.status(404).send();
      }

      const project = await projectController.GetById(
        requestedDocument.projectId
      );
      if (!project.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }
      logRes(200, requestedDocument);
      return res.status(200).send(requestedDocument);
    }
  );
  */

  /**
   * Update Entity Document
   */
  /*
  app.put(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await entityDocumentController.GetById(
          req.params.id
        );
        if (!requestedDocument) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedDocument.projectId
        );
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
        const updates = req.body;

        const updatedDocument = await entityDocumentController.Update(
          requestedDocument,
          updates
        );
        logRes(200, updatedDocument);
        return res.status(200).send(updatedDocument);
      } catch (e) {
        res.status(500).send();
      }
    }
  );
  */

  /**
   * Delete Entity Document
   */
  /*
  app.delete(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      console.log("DELETE: " + base);
      try {
        const requestedDocument = await entityDocumentController.GetById(
          req.params.id
        );
        if (!requestedDocument) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedDocument.projectId
        );
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
        const deletedDocument = await entityDocumentController.Delete(
          requestedDocument._id
        );
        logRes(200, deletedDocument);
        return res.status(200).send(deletedDocument);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
  */
};
