
import User, { IUser, IUserDTO, IUserUpdatesDTO } from "../models/user.model";
import mongoose from "mongoose";

async function Create(user: IUserDTO): Promise<IUser> {
  return User.create(user)
    .then((data: IUser) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function Flush(): Promise<number> {
  return new Promise(async (resolve) => {
    const result = await User.deleteMany({});
    return resolve(result.deletedCount);
  });
}

async function Get(): Promise<IUser[]> {
  return new Promise(async (resolve) => {
    const users = await User.find();
    return resolve(users);
  });
}

async function GetByGoogleId(googleId: string): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { googleId: googleId };
      let user = await User.findOne(query);
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
}

async function GetById(id: mongoose.Types.ObjectId): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(id);
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
}

async function GetByEmail(email: string): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      let query = { email: email };
      let user = await User.findOne(query);
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
}

async function Update(user: IUser, updates: IUserUpdatesDTO): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        email: updates.email,
        nickName: updates.nickName,
        avatarUrl: updates.avatarUrl,
        projects: updates.projects 
      }

      const updatedUser = await User.findByIdAndUpdate(user._id, sanitizedUpdates, { new: true });

      resolve(updatedUser);
    } catch (e) {
      reject(e);
    }
  });
}

async function GetRandom(size: number): Promise<IUser> {
  return new Promise(async (resolve) => {
    let doc = await User.aggregate([{ $sample: { size: size } }]);
    resolve(<IUser>doc[0]);
  });
}

async function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await User.findByIdAndDelete(id);
      resolve(deleted != null);
    } catch (e) {
      reject(e);
    }
  });
}

export default {
  Create,
  Flush,
  Get,
  GetByGoogleId,
  GetByEmail,
  Update,
  GetById,
  GetRandom,
  Delete,
};
