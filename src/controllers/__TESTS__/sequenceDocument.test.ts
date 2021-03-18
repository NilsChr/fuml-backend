import mongoose from "mongoose";
import projectController from "../project.controller";
import sequenceDocumentController from "../sequenceDocument.controller";
import userController from "../user.controller";
import testUtil from "./testUtil";

describe("Sequence Document Controller", () => {
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

  it("Should create a sequence document", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    const sequenceDocument = await testUtil.generateRandomSequenceDocument(user._id, project._id);
    expect(sequenceDocument).not.toBeNull();
    expect(sequenceDocument.type).toBe('SEQUENCE');

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.sequenceDocuments.length).toBe(1);

  })  

  it("Should delete a sequence document and remove sequence document from project", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);
    const sequenceDocument = await testUtil.generateRandomSequenceDocument(user._id, project._id);
    expect(sequenceDocument).not.toBeNull();
    expect(sequenceDocument.type).toBe('SEQUENCE');

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.sequenceDocuments.length).toBe(1);

    await sequenceDocumentController.Delete(sequenceDocument._id);

    const updatedProjectAfter = await projectController.GetById(project._id);
    expect(updatedProjectAfter.sequenceDocuments.length).toBe(0);
  });
});
