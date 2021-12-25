import User, { IUser, IUserDTO, IUserUpdatesDTO } from "../models/user.model";
import mongoose from "mongoose";

function Create(user: IUserDTO): Promise<IUser> {
  if(!user.nickName) {
    user.nickName = 'no username'
  }

  return User.create(user)
    .then((data: IUser) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

function Flush(): Promise<number> {
  return new Promise(async (resolve) => {
    const result = await User.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IUser[]> {
  return new Promise(async (resolve) => {
    const users = await User.find();
    return resolve(users);
  });
}

function GetByGoogleId(googleId: string): Promise<IUser> {
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

function GetById(id: mongoose.Types.ObjectId): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await User.findById(id);
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
}

function GetByEmail(email: string): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { email: email };
      const user = await User.findOne(query);
      resolve(user);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

function GetByNickname(nickname: string): Promise<any[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { nickName: {$regex : new RegExp(".*" + nickname + ".*", "i")} };
      const users = await User.find(query).limit(5);
      console.log("USERS", users);
      const usersOut = users.map(u => {
        return {
          _id: u._id,
          nickName: u.nickName,
          avatarUrl: u.avatarUrl
        }
      })
      console.log("USERS OUT", users);

      resolve(usersOut);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

function Update(user: IUser, updates: IUserUpdatesDTO): Promise<IUser> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        email: updates.email,
        nickName: updates.nickName,
        avatarUrl: updates.avatarUrl,
        projects: updates.projects,
        selectedTheme: updates.selectedTheme
      };

      if(!sanitizedUpdates.nickName) {
        delete sanitizedUpdates.nickName;
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedUser);
    } catch (e) {
      reject(e);
    }
  });
}

function GetRandom(size: number): Promise<IUser> {
  return new Promise(async (resolve) => {
    let doc = await User.aggregate([{ $sample: { size: size } }]);
    resolve(<IUser>doc[0]);
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
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
  GetByNickname,
  Update,
  GetById,
  GetRandom,
  Delete,
};
