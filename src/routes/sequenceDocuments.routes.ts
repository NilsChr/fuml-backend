import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import projectController from "../controllers/project.controller";
import { ISequenceDocumentConstructor } from "../models/sequenceDocument.model";
import sequenceDocumentController from "../controllers/sequenceDocument.controller";
import { apiRoutes } from "./routeRegistry";

export default ({ app }: TRoutesInput) => {
  /**
   * Post SequenceDocuments
   */
  app.post(
    apiRoutes.sequenceDocuments,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const project = await projectController.GetById(req.body.projectId);
        if (!project) {
          return res.status(404).send();
        }
        const projectData: ISequenceDocumentConstructor = {
          title: req.body.title,
          ownerId: req.user._id,
          projectId: req.body.projectId,
        };
        const newDoc = await sequenceDocumentController.Create(projectData);
        res.status(201).send(newDoc);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Sequence Document
   */
  app.get(
    apiRoutes.sequenceDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedDocument = await sequenceDocumentController.GetById(
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
   * Update Sequence Document
   */
  app.put(
    apiRoutes.sequenceDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await sequenceDocumentController.GetById(
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

        const updatedDocument = await sequenceDocumentController.Update(
          requestedDocument,
          updates
        );
        logRes(200, updatedDocument);
        return res.status(200).send(updatedDocument);
      } catch (e) {
          console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Sequence Document
   */
  app.delete(
    apiRoutes.sequenceDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await sequenceDocumentController.GetById(
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
        const deletedDocument = await sequenceDocumentController.Delete(
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
