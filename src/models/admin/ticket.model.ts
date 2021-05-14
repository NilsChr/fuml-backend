import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  created: Number;
  lastUpdated: Number;
  title: string;
  description: string;
  status: string;
  priority: Number;
  seenByUser: number;
  seenByAdmin: number;
  version: number;
}

export interface ITicketDTO {
  userId: string;
  created: Number;
  lastUpdated: Number;
  title: string;
  description: string;
  status: string;
  priority: Number;
  seenByUser: number;
  seenByAdmin: number;
  version: number;
}

export interface ITicketDTO {
  lastUpdated: Number;
  title: string;
  description: string;
  status: string;
  priority: Number;
  seenByUser: number;
  seenByAdmin: number;
  version: number;
}

const TicketSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  created: { type: Number, default: Date.now() },
  lastUpdated: { type: Number, default: Date.now() },
  title: { type: String, unique: false, sparse: true },
  description: { type: String, unique: false, sparse: true },
  status: { type: String, unique: false, sparse: true },
  priority: { type: Number },
  seenByUser: { type: Number },
  seenByAdmin: { type: Number },
  version: { type: Number },
});

// Export the model and return your IUser interface
export default mongoose.model<ITicket>("Ticket", TicketSchema);
