import mongoose from "mongoose";
import entityDocumentController from "../entityDocument.controller";
import projectController from "../project.controller";
import sequenceDocumentController from "../sequenceDocument.controller";
import userController from "../user.controller";
import testUtil from "./testUtil";

describe("Entity Document Controller", () => {
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
    await sequenceDocumentController.Flush();
  });

  it("Should create an entity document", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    const entityDocument = await testUtil.generateRandomEntityDocument(user._id, project._id);
    expect(entityDocument).not.toBeNull();
    expect(entityDocument.type).toBe('ENTITY');

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.entityDocuments.length).toBe(1);

  })  

  it("Should delete a entity document and remove entity document from project", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    const entityDocument = await testUtil.generateRandomEntityDocument(user._id, project._id);
    expect(entityDocument).not.toBeNull();
    expect(entityDocument.type).toBe('ENTITY');

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.entityDocuments.length).toBe(1);

    await entityDocumentController.Delete(entityDocument._id);

    const updatedProjectAfter = await projectController.GetById(project._id);
    expect(updatedProjectAfter.entityDocuments.length).toBe(0);
  });
});
