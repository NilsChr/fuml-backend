import mongoose from "mongoose";
import kanbanBoardModel from "../models/kanban/kanbanBoard.model";
import kanbanBoardCardModel from "../models/kanban/kanbanBoardCard.model";
import kanbanBoardCommentModel from "../models/kanban/kanbanBoardComment.model";
import Project, {
  IProject,
  IProjectDTO,
  IProjectUpdatesDTO,
} from "../models/project.model";
import User, { IUser } from "../models/user.model";
import entityDocumentController from "./entityDocument.controller";
import kanbanBoardController from "./kanban/kanbanBoard.controller";
import kanbanBoardCardController from "./kanban/kanbanBoardCard.controller";
import kanbanBoardCardCommentController from "./kanban/kanbanBoardCardComment.controller";
import sequenceDocumentController from "./sequenceDocument.controller";
import textDocumentController from "./textDocument.controller";
import userController from "./user.controller";

function Create(project: IProjectDTO): Promise<IProject> {
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

function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await Project.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IProject[]> {
  return new Promise(async (resolve, reject) => {
    const projects = await Project.find();
    return resolve(projects);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    const project = await Project.findById(id);
    return resolve(project);
  });
}

function GetForCollaborator(user: IUser): Promise<IProject[]> {
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

function AddCollaborator(user: IUser, project: IProject): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    try {
      // Allready a collaborator
      if (project.collaborators.includes(user._id)) {
        return resolve(project);
      }
      project.collaborators.push(user._id);
      user.projects.push(project._id);
      await userController.Update(user, user);
      resolve(await Update(project, project));
    } catch (e) {
      reject(e);
    }
  });
}

function RemoveCollaborator(user: IUser, project: IProject): Promise<IProject> {
  return new Promise(async (resolve, reject) => {
    try {
      const index = project.collaborators.indexOf(user._id);
      project.collaborators.splice(index, 1);

      const projectIndex = user.projects.indexOf(project._id);
      user.projects.splice(projectIndex, 1);
      await userController.Update(user, user);

      const updated = await Update(project, project);
      resolve(updated);
    } catch (e) {
      reject(e);
    }
  });
}

function Update(
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
        textDocuments: updates.textDocuments,
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

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const project = await Project.findById(id);

      // DELETE SEQUENCE DOCUMENTS
      for (let i = 0; i < project.sequenceDocuments.length; i++) {
        const sequenceDocument = project.sequenceDocuments[i];
        await sequenceDocumentController.Delete(sequenceDocument);
      }

      // DELETE ENTITY DOCUMENTS
      for (let i = 0; i < project.entityDocuments.length; i++) {
        const entityDocument = project.entityDocuments[i];
        await entityDocumentController.Delete(entityDocument);
      }

      // DELETE TEXT DOCUMENTS
      for (let i = 0; i < project.textDocuments.length; i++) {
        const textDocument = project.textDocuments[i];
        await textDocumentController.Delete(textDocument);
      }

      // REMOVE PROJECTS FROM USERS
      const usersWithProject = await User.find({ projects: project._id });
      for (let i = 0; i < usersWithProject.length; i++) {
        const user = usersWithProject[i];
        const index = user.projects.indexOf(project._id);
        user.projects.splice(index, 1);
        await userController.Update(user, user);
      }

      // REMOVE BOARDS AND COMMENTS
      const projectBoards = await kanbanBoardModel.find({
        projectId: project._id,
      });
      for (let i = 0; i < projectBoards.length; i++) {
        const board = projectBoards[i];
        const boardCards = await kanbanBoardCardModel.find({
          boardId: board._id,
        });

        for (let j = 0; j < boardCards.length; j++) {
          const card = boardCards[i];

          const comments = await kanbanBoardCommentModel.find({
            cardId: card._id,
          });
          comments.forEach(async (c) => {
            await kanbanBoardCardCommentController.Delete(c._id);
          });

          await kanbanBoardCardController.Delete(card._id);
        }

        await kanbanBoardController.Delete(board._id);
      }

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
