import mongoose from "mongoose";
import TextDocument,{ ITextDocument, ITextDocumentConstructor, ITextDocumentDTO } from "../models/textDocument.model";
import projectController from "./project.controller";

function Create(document: ITextDocumentConstructor): Promise<ITextDocument> {
  const doc: ITextDocumentDTO = {
    title: document.title,
    ownerId: document.ownerId,
    projectId: document.projectId,
    type: "TEXT",
    created: new Date().getTime(),
    text: ''
  };
  return TextDocument.create(doc)
    .then(async (data: ITextDocument) => {
      const project = await projectController.GetById(doc.projectId);
      project.textDocuments.push(data._id);
      console.log("ADDADADADAD");
      console.log(project);
      await projectController.Update(project, project);
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await TextDocument.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<ITextDocument[]> {
  return new Promise(async (resolve, reject) => {
    const documents = await TextDocument.find();
    return resolve(documents);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<ITextDocument> {
  return new Promise(async (resolve, reject) => {
    const document = await TextDocument.findById(id);
    return resolve(document);
  });
}

function Update(
  document: ITextDocument,
  updates: ITextDocumentDTO
): Promise<ITextDocument> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        text: updates.text
      };

      const updatedProject = await TextDocument.findByIdAndUpdate(
        document._id,
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
      let deleted = await TextDocument.findByIdAndDelete(id);
      const project = await projectController.GetById(deleted.projectId);
      const index = project.textDocuments.indexOf(deleted._id);
      project.textDocuments.splice(index, 1);
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
