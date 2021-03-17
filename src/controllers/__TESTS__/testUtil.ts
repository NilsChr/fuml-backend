import mongoose from "mongoose";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";
import projectController from "../project.controller";
import userController from "../user.controller";

const testUtil = {
  generateRandomName(): string {
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ1234567890";
    let out = "";
    for (let i = 0; i < 10; i++) {
      let index = Math.floor(Math.random() * abc.length);
      out += abc.charAt(index);
    }
    return out;
  },
  async generateRandomUser(): Promise<IUser> {

    return new Promise((resolve) => {
      const user = userController.Create({
        nickName:  this.generateRandomName(),
        avatarUrl:  this.generateRandomName(),
        email:  this.generateRandomName(),
        googleId:  this.generateRandomName(),
        isAdmin: false,
        projects: [],
        created: new Date().getTime()
      });
      resolve(user);
    });
    
  },
  async generateRandomProject(ownerId: mongoose.Types.ObjectId): Promise<IProject> {

    return new Promise((resolve) => {
      const project = projectController.Create({
        title:  this.generateRandomName(),
        documents: [],
        ownerId: ownerId,
        created: new Date().getTime(),
        collaborators: []
      });
      resolve(project);
    });
  },
  async wait(time: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve();
      }, time);
    });
  },
  generateFakeBase64String(characters: number) {
    let data = "";
    for (let i = 0; i < characters; i++) {
      data += "a";
    }
    return data;
  },
};

export default testUtil;
