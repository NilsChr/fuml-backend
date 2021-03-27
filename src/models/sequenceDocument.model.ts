import mongoose, { Schema, Document } from "mongoose";

class DocumentSequencePart {
  title: string;
  editorOpen: boolean;
  visible: boolean;
  block: boolean;
  code: string;
}

export interface ISequenceDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  sequenceParts: DocumentSequencePart[];
  sequenceParticipants: string[];
}

export interface ISequenceDocumentDTO {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  sequenceParts: DocumentSequencePart[];
  sequenceParticipants: string[];
}

export interface ISequenceDocumentConstructor {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
}

const SequenceDocumentPartSchema: Schema = new Schema({
  title: { type: String, required: true },
  editorOpen: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
  block: { type: Boolean, default: true },
  code: { type: String, default: "" },
});

const SequenceDocumentSchema: Schema = new Schema({
  projectId: [{ type: mongoose.Types.ObjectId, ref: "Project" }],
  ownerId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  type: { type: String, default: "ENTITY" },

  sequenceParts: [SequenceDocumentPartSchema],
  sequenceParticipants: [{ type: String, required: false }],
});

export default mongoose.model<ISequenceDocument>(
  "SequenceDocument",
  SequenceDocumentSchema
);
