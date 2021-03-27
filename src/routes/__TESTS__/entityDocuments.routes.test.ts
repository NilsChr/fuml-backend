import mongoose from "mongoose";
import request from "supertest";
import entityDocumentController from "../../controllers/entityDocument.controller";
import projectController from "../../controllers/project.controller";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IEntityDocumentConstructor, IEntityDocumentDTO } from "../../models/entityDocument.model";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";

describe("User routes", () => {
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
    server.close();
  });

  beforeEach(async () => {
    await testUtilFirebase.signOut();
    await userController.Flush();
    await projectController.Flush();
  });

  it("Should create an entity document", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body;

    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send({title: 'test'});

    const project: IProject = (<any>postProjectRes).body;

    let constructor:IEntityDocumentConstructor = {
      title: 'entityTitle',
      projectId: project._id,
      ownerId: user._id
    }
    const doc = await entityDocumentController.Create(constructor);
    expect(doc).not.toBeNull();

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.entityDocuments).toContainEqual(doc._id);
  });

});
