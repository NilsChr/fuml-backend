import mongoose from "mongoose";
import request from "supertest";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
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
  });

  it("Should connect to app and create a project", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");

    const user: IUser = (<any>res).body;
    const projectBody = {
      title: "firstTestTitle",
    };

    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send(projectBody);

    expect(postProjectRes.status).toBe(201);
    const project: IProject = (<any>postProjectRes).body;

    expect(project.collaborators).toContain(user._id);

    const updatedUser = await userController.GetById(user._id);
    expect(updatedUser.projects.length).toBe(1);

  });
});
