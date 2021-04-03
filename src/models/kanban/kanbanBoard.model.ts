import mongoose, { Schema,Document } from "mongoose";

export interface IKanbanBoardContructor {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  private: boolean;
  backgroundColor: string;
}

export interface IKanbanBoardDTO {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  private: boolean;
  backgroundColor: string;
  labels: IKanbanBoardLabel[];
  cardsTodo: Number;
  cardsPending:  Number;
  cardsInProgress:  Number;
  cardsDone:  Number;
}

export interface IKanbanBoardLabel {
  title: string;
  color: string;
}

export interface IKanbanBoardSchema extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  private: boolean;
  backgroundColor: string;
  labels: IKanbanBoardLabel[];
  cardsTodo: Number;
  cardsPending:  Number;
  cardsInProgress:  Number;
  cardsDone:  Number;
}

const KanbanBoardSchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: "Project" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  private: { type: Boolean, default: false },
  backgroundColor: { type: String },
  labels: [{ title: { type: String }, color: { type: String } }],
  cardsTodo: { type: Number, default: 0},
  cardsPending: { type: Number, default: 0},
  cardsInProgress: { type: Number, default: 0},
  cardsDone: { type: Number, default: 0}
});

export default mongoose.model<IKanbanBoardSchema>("KanbanBoard", KanbanBoardSchema);
