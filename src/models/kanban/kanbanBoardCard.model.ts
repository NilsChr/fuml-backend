import mongoose, { Schema, Document } from "mongoose";
import { IKanbanBoardLabel } from "./kanbanBoard.model";
import { IKanbanBoardCardCommentSchema } from "./kanbanBoardComment.model";

export enum KanbanBoardCardStatus {
  todo = 0,
  inProgress = 1,
  pending = 2,
  done = 3,
}

export interface IKanbanBoardCardConstructor {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: KanbanBoardCardStatus;
}

export interface IKanbanBoardCardSchema extends Document {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  status: KanbanBoardCardStatus;
  created: Number;
  completed: Number;
  description: string;
  labels: mongoose.Types.ObjectId[];
  assignees: mongoose.Types.ObjectId[];
  archived: boolean;
}

export interface IKanbanBoardCardDTO {
  boardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  status: KanbanBoardCardStatus;
  created: Number;
  completed: Number;
  description: string;
  labels: mongoose.Types.ObjectId[];
  assignees: mongoose.Types.ObjectId[];
  archived: boolean;
}

const KanbanBoardCardSchema: Schema = new Schema({
  boardId: { type: mongoose.Types.ObjectId, ref: "Board" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  assignees: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true },
  status: { type: KanbanBoardCardStatus },
  created: { type: Number, default: Date.now() },
  completed: { type: Number, default: Date.now() },
  description: { type: String },
  //labels: [{ title: { type: String }, color: { type: String } }],
  labels: [{type: mongoose.Types.ObjectId}],
  archived: { type: Boolean}
});

export default mongoose.model<IKanbanBoardCardSchema>(
  "KanbanBoardCard",
  KanbanBoardCardSchema
);
