import mongoose from "mongoose";
import Project, {
  IProject,
  IProjectDTO,
  IProjectUpdatesDTO,
} from "../models/project.model";
import { IUser } from "../models/user.model";
import userController from "./user.controller";

async function Create(project: IProjectDTO): Promise<IProject> {
  project.collaborators.push(project.ownerId);
  return Project.create(project)
    .then(async (data: IProject) => {
      const user = await userController.GetById(project.ownerId);
      user.projects.push(data._id);
      await userController.Update(user, user);

      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

async function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await Project.deleteMany({});
    return resolve(result.deletedCount);
  });
}

async function Get(): Promise<IProject[]> {
  return new Promise(async (resolve, reject) => {
    const projects = await Project.find();
    return resolve(projects);
  });
}

async function GetById(id: mongoose.Types.ObjectId): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    const project = await Project.findById(id);
    return resolve(project);
  });
}

async function GetForCollaborator(user: IUser): Promise<IProject[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { collaborators: user._id };
      const projects = await Project.find(query);
      resolve(projects);
    } catch (e) {
      reject(e);
    }
  });
}

async function AddCollaborator(
  user: IUser,
  project: IProject
): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    try {
      // Allready a collaborator
      if (project.collaborators.includes(user._id)) {
        return resolve(project);
      }
      project.collaborators.push(user._id);
      user.projects.push(project._id);
      await userController.Update(user,user);
      resolve(await Update(project, project));
    } catch (e) {
      reject(e);
    }
  });
}

async function RemoveCollaborator(
  user: IUser,
  project: IProject
): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    try {
      const index = project.collaborators.indexOf(user._id);
      project.collaborators.splice(index, 1);

      const projectIndex = user.projects.indexOf(project._id);
      user.projects.splice(projectIndex,1);
      await userController.Update(user,user);

      const updated = await Update(project, project);
      resolve(updated);
    } catch (e) {
      reject(e);
    }
  });
}

async function Update(
  project: IProject,
  updates: IProjectUpdatesDTO
): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        collaborators: updates.collaborators,
        entityDocuments: updates.entityDocuments,
        sequenceDocuments: updates.sequenceDocuments,
      };

      const updatedProject = await Project.findByIdAndUpdate(
        project._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedProject);
    } catch (e) {
      reject(e);
    }
  });
}

async function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await Project.findByIdAndDelete(id);
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
  GetById,
  GetForCollaborator,
  AddCollaborator,
  RemoveCollaborator,
  Update,
  Delete,
};
