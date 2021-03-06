import mongoose, { Document } from "mongoose";
import SequenceDocument, {
  ISequenceDocument,
  ISequenceDocumentConstructor,
  ISequenceDocumentDTO,
} from "../models/sequenceDocument.model";
import projectController from "./project.controller";

function Create(document: ISequenceDocumentConstructor): Promise<ISequenceDocument> {
  const doc: ISequenceDocumentDTO = {
    title: document.title,
    ownerId: document.ownerId,
    projectId: document.projectId,
    type: "SEQUENCE",
    created: new Date().getTime(),
    participants: [],
    parts: [],
  };
  return SequenceDocument.create(doc)
    .then(async (data: ISequenceDocument) => {
      const project = await projectController.GetById(doc.projectId);
      project.sequenceDocuments.push(data._id);
      await projectController.Update(project, project);
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await SequenceDocument.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<ISequenceDocument[]> {
  return new Promise(async (resolve, reject) => {
    const documents = await SequenceDocument.find();
    return resolve(documents);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<ISequenceDocument> {
  return new Promise(async (resolve, reject) => {
    const document = await SequenceDocument.findById(id);
    return resolve(document);
  });
}

function Update(
  sequenceDocument: ISequenceDocument,
  updates: ISequenceDocumentDTO
): Promise<ISequenceDocument> {
  console.log('UPDATE');
  return new Promise(async (resolve, reject) => {
    try {
      console.log(updates);
      const sanitizedUpdates = {
        title: updates.title,
        parts: updates.parts,
        participants: updates.participants,
      };

      const updatedProject = await SequenceDocument.findByIdAndUpdate(
        sequenceDocument._id,
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
      let deleted = await SequenceDocument.findByIdAndDelete(id);
      const project = await projectController.GetById(deleted.projectId);
      const index = project.sequenceDocuments.indexOf(deleted._id);
      project.sequenceDocuments.splice(index, 1);
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
