import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import projectController from "../controllers/project.controller";
import { ISequenceDocumentConstructor } from "../models/sequenceDocument.model";
import sequenceDocumentController from "../controllers/sequenceDocument.controller";
import { apiRoutes } from "./routeRegistry";
import { ITextDocumentConstructor } from "../models/textDocument.model";
import textDocumentController from "../controllers/textDocument.controller";
import memoryUtil from "../util/memoryCheck";

export default ({ app }: TRoutesInput) => {
  /**
   * Post TextDocuments
   */
  app.post(
    apiRoutes.textDocuments,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const project = await projectController.GetById(req.body.projectId);
        if (!project) {
          return res.status(404).send();
        }
        const documentData: ITextDocumentConstructor = {
          title: req.body.title,
          ownerId: req.user._id,
          projectId: req.body.projectId,
        };
        const newDoc = await textDocumentController.Create(documentData);
        res.status(201).send(newDoc);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Text Document
   */
  app.get(
    apiRoutes.textDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedDocument = await textDocumentController.GetById(
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
   * Update Text Document
   */
  app.put(
    apiRoutes.textDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await textDocumentController.GetById(
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

        const size = memoryUtil.memorySizeOfInBytes(updates);
        if(size > 2500000) {
            return res.status(403).send();
        }

        const updatedDocument = await textDocumentController.Update(
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
   * Delete Text Document
   */
  app.delete(
    apiRoutes.textDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await textDocumentController.GetById(
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
        const deletedDocument = await textDocumentController.Delete(
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
