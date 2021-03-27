import { TRoutesInput } from "../types/routes";
import { checkIfAuthenticated } from "../middlewares/auth.middleware";
import { logReq, logRes } from "../middlewares/log.middleware";
import projectController from "../controllers/project.controller";
import { IProjectDTO } from "../models/project.model";
import entityDocumentModel, {
  IEntityDocumentConstructor,
} from "../models/entityDocument.model";
import entityDocumentController from "../controllers/entityDocument.controller";
import { ISequenceDocumentConstructor } from "../models/sequenceDocument.model";
import sequenceDocumentController from "../controllers/sequenceDocument.controller";

export default ({ app }: TRoutesInput) => {
  let base = "/api/sequencedocuments";

  /**
   * Post SequenceDocuments
   */
  app.post(
    base,
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
          ownerId: req.body.ownerId,
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
    base + "/:id",
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
    base + "/:id",
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
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Entity Document
   */
  app.delete(
    base + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      console.log("DELETE: " + base);
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
