import mongoose, { Document } from "mongoose";
import SequenceDocument, {
  ISequenceDocument,
  ISequenceDocumentDTO,
} from "../models/sequenceDocument.model";
import projectController from "./project.controller";

function Create(document: ISequenceDocumentDTO): Promise<ISequenceDocument> {
  document.type = "SEQUENCE";
  return SequenceDocument.create(document)
    .then(async (data: ISequenceDocument) => {
      const project = await projectController.GetById(document.projectId);
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
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        sequenceParts: updates.sequenceParts,
        sequenceParticipants: updates.sequenceParticipants,
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
