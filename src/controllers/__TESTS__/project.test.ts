import mongoose from "mongoose";
import projectController from "../project.controller";
import userController from "../user.controller";
import testUtil from "./testUtil";

describe("User Controller", () => {
  beforeAll(async () => {
    const m = await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  beforeEach(async () => {
    await userController.Flush();
    await projectController.Flush();
  });

  it("Should create a project", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    expect(project).not.toBeNull();
    expect(project.ownerId).toEqual(user._id);
    expect(project.entityDocuments.length).toEqual(0);
    expect(project.sequenceDocuments.length).toEqual(0);
    expect(project.collaborators.length).toEqual(1);
  });

  it("Should get all projects", async () => {
    const user = await testUtil.generateRandomUser();
    await testUtil.generateRandomProject(user._id);
    await testUtil.generateRandomProject(user._id);

    const allProjects = await projectController.Get();

    expect(allProjects.length).toBe(2);
  });

  it("Should get project by id", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const gotProject = await projectController.GetById(project._id);
    expect(project._id).toEqual(gotProject._id);
  });

  it("Should get all projects for user", async () => {
    const user = await testUtil.generateRandomUser();
    const user2 = await testUtil.generateRandomUser();

    await testUtil.generateRandomProject(user._id);
    await testUtil.generateRandomProject(user2._id);

    const allProjects = await projectController.GetForCollaborator(user);

    expect(allProjects.length).toBe(1);
  });

  it("Should add user to project", async () => {
    const user = await testUtil.generateRandomUser();
    const user2 = await testUtil.generateRandomUser();

    const project = await testUtil.generateRandomProject(user._id);
    expect(project.collaborators.length).toBe(1);

    await projectController.AddCollaborator(user2, project);

    const projectsAfterUpdate = await projectController.GetById(project._id);
    expect(projectsAfterUpdate.collaborators.length).toBe(2);
  });

  it("Should not add user to project if allready collaborator", async () => {
    const user = await testUtil.generateRandomUser();

    const project = await testUtil.generateRandomProject(user._id);
    expect(project.collaborators.length).toBe(1);

    await projectController.AddCollaborator(user, project);

    const projectsAfterUpdate = await projectController.GetById(project._id);
    expect(projectsAfterUpdate.collaborators.length).toBe(1);
  });

  it("Should remove collaborator from project", async () => {
    const user = await testUtil.generateRandomUser();
    const user2 = await testUtil.generateRandomUser();

    const project = await testUtil.generateRandomProject(user._id);
    expect(project.collaborators.length).toBe(1);

    await projectController.AddCollaborator(user2, project);

    const projectsAfterUpdate = await projectController.GetById(project._id);
    expect(projectsAfterUpdate.collaborators.length).toBe(2);

    await projectController.RemoveCollaborator(user, project);

    const projectsAfterRemoval = await projectController.GetById(project._id);
    expect(projectsAfterRemoval.collaborators.length).toBe(1);

    const userAfterUpdate = await userController.GetById(user._id);
    expect(userAfterUpdate.projects.length).toBe(0);
  });

  it("Should delete a project", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    expect(project).not.toBeNull();

    const allProjectsBeforeDelete = await projectController.Get();
    expect(allProjectsBeforeDelete.length).toBe(1);

    await projectController.Delete(project._id);

    const allProjectsAfter = await projectController.Get();
    expect(allProjectsAfter.length).toBe(0);
  });
});
