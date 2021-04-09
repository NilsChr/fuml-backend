import mongoose, { Schema, Document } from "mongoose";

export interface ITextDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  text: string;
}

export interface ITextDocumentConstructor {
    projectId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    title: string;
  }
  

export interface ITextDocumentDTO {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  text: string;
}

const TextDocumentSchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: "Project" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  type: { type: String, default: "TEXT" },
  text: { type: String },
});

export default mongoose.model<ITextDocument>(
  "TextDocument",
  TextDocumentSchema
);
