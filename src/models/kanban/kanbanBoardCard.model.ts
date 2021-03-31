import mongoose, { Schema, Document } from "mongoose";
import { IKanbanBoardLabel } from "./kanbanBoard.model";
import { IKanbanBoardCardCommentSchema } from "./kanbanBoardComment.model";

export enum KanbanBoardCardStatus {
  todo = 0,
  inProgress = 1,
  pending = 3,
  done = 2,
}

export interface IKanbanBoardCardConstructor {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
}

export interface IKanbanBoardCardSchema extends Document {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  status: KanbanBoardCardStatus;
  created: Number;
  description: string;
  labels: IKanbanBoardLabel[];
  assignees: mongoose.Types.ObjectId[]
}

export interface IKanbanBoardCardDTO {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  status: KanbanBoardCardStatus;
  created: Number;
  description: string;
  labels: IKanbanBoardLabel[];
  assignees: mongoose.Types.ObjectId[]
}

const KanbanBoardCardSchema: Schema = new Schema({
  boardId: { type: mongoose.Types.ObjectId, ref: "Board" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  assignees: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  status: { type: KanbanBoardCardStatus },
  created: { type: Number, default: Date.now() },
  description: { type: String },
  labels: [{ title: { type: String }, color: { type: String } }],
});

export default mongoose.model<IKanbanBoardCardSchema>(
  "KanbanBoardCard",
  KanbanBoardCardSchema
);
