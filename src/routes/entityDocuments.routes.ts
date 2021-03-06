import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import projectController from "../controllers/project.controller";
import {
  IEntityDocumentConstructor,
} from "../models/entityDocument.model";
import entityDocumentController from "../controllers/entityDocument.controller";
import { apiRoutes } from "./routeRegistry";

export default ({ app }: TRoutesInput) => {

  /**
   * Post EntityDocuments
   */
  app.post(
    apiRoutes.entityDocuments,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const project = await projectController.GetById(req.body.projectId);
        if (!project) {
          return res.status(404).send();
        }
        const projectData: IEntityDocumentConstructor = {
          title: req.body.title,
          ownerId: req.user._id,//req.body.ownerId,
          projectId: req.body.projectId,
        };
        const newDoc = await entityDocumentController.Create(projectData);
        res.status(201).send(newDoc);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Entity Document
   */
  app.get(
    apiRoutes.entityDocuments + "/:id",
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

  /**
   * Update Entity Document
   */
  app.put(
    apiRoutes.entityDocuments + "/:id",
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

  /**
   * Delete Entity Document
   */
  app.delete(
    apiRoutes.entityDocuments + "/:id",
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
};
