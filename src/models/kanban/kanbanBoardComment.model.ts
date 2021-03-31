import mongoose, { Schema, Document } from "mongoose";

export interface IKanbanBoardCardCommentSchema extends Document {
  cardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  text: string;
  created: Number;
}

export interface IKanbanBoardCardCommentDTO {
  cardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  text: string;
  created: Number;
}

export interface IKanbanBoardCardCommentConstructor {
  cardId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  text: string;
}

const KanbanBoardCardCommentSchema: Schema = new Schema({
  cardId: { type: mongoose.Types.ObjectId, ref: "KanbanBoardCard" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  created: { type: Number, default: Date.now() },
});

export default mongoose.model<IKanbanBoardCardCommentSchema>(
  "KanbanBoardCardComment",
  KanbanBoardCardCommentSchema
);
