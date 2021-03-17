import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  googleId: string;
  email: string;
  nickName: string;
  created: Number;
  avatarUrl: String;
  isAdmin: Boolean;
  projects: mongoose.Types.ObjectId[];
}

export interface IUserDTO {
  googleId: string;
  email: string;
  nickName: string;
  created: Number;
  avatarUrl: String;
  isAdmin: Boolean;
  projects: mongoose.Types.ObjectId[];
}

export interface IUserUpdatesDTO {
  email: string;
  nickName: string;
  avatarUrl: String;
  projects: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  nickName: { type: String, unique: false, sparse: true },
  created: { type: Number, default: Date.now() },
  avatarUrl: { type: String },
  isAdmin: { type: Boolean },
  projects: [{ type: mongoose.Types.ObjectId, ref: "Project" }],
});

// Export the model and return your IUser interface
export default mongoose.model<IUser>("User", UserSchema);
