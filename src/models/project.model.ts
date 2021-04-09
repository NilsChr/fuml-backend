import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  entityDocuments: mongoose.Types.ObjectId[];
  sequenceDocuments: mongoose.Types.ObjectId[];
  textDocuments: mongoose.Types.ObjectId[];
  created: Number;
  ownerId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
}
export interface IProjectDTO {
  title: string;
  entityDocuments: mongoose.Types.ObjectId[];
  sequenceDocuments: mongoose.Types.ObjectId[];
  textDocuments: mongoose.Types.ObjectId[];

  created: Number;
  ownerId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
}
export interface IProjectUpdatesDTO {
  title: string;
  entityDocuments: mongoose.Types.ObjectId[];
  sequenceDocuments: mongoose.Types.ObjectId[];
  textDocuments: mongoose.Types.ObjectId[];
  collaborators: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  entityDocuments: [{ type: mongoose.Types.ObjectId, ref: "EntityDocument" }],
  sequenceDocuments: [{ type: mongoose.Types.ObjectId, ref: "SequenceDocument" }],
  textDocuments: [{ type: mongoose.Types.ObjectId, ref: "TextDocument" }],
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  collaborators: [{ type: mongoose.Types.ObjectId, ref: "User" }],
});

// Export the model and return your IUser interface
export default mongoose.model<IProject>("Project", ProjectSchema);
