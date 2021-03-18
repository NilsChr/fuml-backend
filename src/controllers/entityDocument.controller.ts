import mongoose, { Document } from "mongoose";
import EntityDocument, { IEntityDocument, IEntityDocumentDTO } from "../models/entityDocument.model";
import projectController from "./project.controller";

async function Create(
    document: IEntityDocumentDTO
  ): Promise<IEntityDocument> {
    document.type = "ENTITY";
    return EntityDocument.create(document)
      .then(async (data: IEntityDocument) => {
        const project = await projectController.GetById(document.projectId);
        project.entityDocuments.push(data._id);
        await projectController.Update(project, project);
        return data;
      })
      .catch((error: Error) => {
        throw error;
      });
  }
async function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await EntityDocument.deleteMany({});
    return resolve(result.deletedCount);
  });
}

async function Get(): Promise<IEntityDocument[]> {
  return new Promise(async (resolve, reject) => {
    const documents = await EntityDocument.find();
    return resolve(documents);
  });
}

async function GetById(id: mongoose.Types.ObjectId): Promise<IEntityDocument> {
  return new Promise(async (resolve, reject) => {
    const document = await EntityDocument.findById(id);
    return resolve(document);
  });
}


async function Update(
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

async function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        let deleted = await EntityDocument.findByIdAndDelete(id);
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
  Delete
};
