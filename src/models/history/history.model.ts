import mongoose, { Schema, Document } from "mongoose";

export enum ChangeHistoryTypes {
  create = 0,
  update = 1,
  delete = 2,
}

export interface IChangeHistory extends Document {
  projectId: mongoose.Types.ObjectId;
  created: string;
  ownerId: mongoose.Types.ObjectId;
  type: ChangeHistoryTypes;
  details: string;
}

export interface IChangeHistoryDTO {
  projectId: mongoose.Types.ObjectId;
  created: string;
  ownerId: mongoose.Types.ObjectId;
  type: ChangeHistoryTypes;
  details: string;
}

const ChangeHistorySchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: "Project" },
  created: { type: String, required: true, unique: false },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  type: { type: ChangeHistoryTypes },
  details: { type: String, required: true, unique: false },
});

// Export the model and return your IUser interface
export default mongoose.model<IChangeHistory>("History", ChangeHistorySchema);
