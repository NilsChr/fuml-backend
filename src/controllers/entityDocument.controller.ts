import mongoose, { Document } from "mongoose";
import EntityDocument, {
  IEntityDocument,
  IEntityDocumentDTO,
  IEntityDocumentConstructor,
} from "../models/entityDocument.model";
import projectController from "./project.controller";

function Create(
  document: IEntityDocumentConstructor
): Promise<IEntityDocument> {
  const doc: IEntityDocumentDTO = {
    title: document.title,
    ownerId: document.ownerId,
    projectId: document.projectId,
    type: "ENTITY",
    created: new Date().getTime(),
    entityProperties: [],
    entityRelations: [],
  };
  return EntityDocument.create(doc)
    .then(async (data: IEntityDocument) => {
      const project = await projectController.GetById(doc.projectId);
      project.entityDocuments.push(data._id);
      await projectController.Update(project, project);
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}
function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await EntityDocument.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IEntityDocument[]> {
  return new Promise(async (resolve, reject) => {
    const documents = await EntityDocument.find();
    return resolve(documents);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<IEntityDocument> {
  return new Promise(async (resolve, reject) => {
    const document = await EntityDocument.findById(id);
    return resolve(document);
  });
}

function Update(
  entityDocument: IEntityDocument,
  updates: IEntityDocumentDTO
): Promise<IEntityDocument> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        entityProperties: updates.entityProperties,
        entityRelations: updates.entityRelations,
      };

      const updatedProject = await EntityDocument.findByIdAndUpdate(
        entityDocument._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedProject);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const deleted = await EntityDocument.findByIdAndDelete(id);
      const project = await projectController.GetById(deleted.projectId);
      const index = project.entityDocuments.indexOf(deleted._id);
      project.entityDocuments.splice(index, 1);
      await projectController.Update(project, project);

      resolve(deleted != null);
    } catch (e) {
      reject(e);
    }
  });
}
export default {
  Create,
  Flush,
  Get,
  GetById,
  Update,
  Delete,
};
