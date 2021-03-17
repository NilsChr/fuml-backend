import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  documents: mongoose.Types.ObjectId[];
  created: Number;
  ownerId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
}
export interface IProjectDTO {
  title: string;
  documents: mongoose.Types.ObjectId[];
  created: Number;
  ownerId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
}
export interface IProjectUpdatesDTO {
  title: string;
  documents: mongoose.Types.ObjectId[];
  collaborators: mongoose.Types.ObjectId[];
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  documents: [{ type: mongoose.Types.ObjectId, ref: "Document" }],
  ownerId: { type: mongoose.Types.ObjectId, ref: "Document" },
  collaborators: [{ type: mongoose.Types.ObjectId, ref: "Document" }],
});

// Export the model and return your IUser interface
export default mongoose.model<IProject>("Project", ProjectSchema);
