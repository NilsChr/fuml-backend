import mongoose from "mongoose";
import request from "supertest";
import projectController from "../../controllers/project.controller";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";

describe("Project routes", () => {
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

  it("Should fail to create a project without a title", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");

    const user: IUser = (<any>res).body;
    const projectBody = {
      title: "",
    };

    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send(projectBody);

    expect(postProjectRes.status).toBe(400);
  });


  it("Should connect to app and create a project then delete it", async () => {
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

    const delProjectRes = await request(app)
      .delete("/api/projects/" + project._id)
      .set({ Authorization: "Bearer " + token });

    expect(delProjectRes.status).toBe(200);

    const updatedUser2 = await userController.GetById(user._id);
    expect(updatedUser2.projects.length).toBe(updatedUser.projects.length - 1);
  });

  it("Should fail to delete project with wrong user", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");

    const user: IUser = (<any>res).body;

    const token2 = await testUtilFirebase.loginFirebase2();
    const res2 = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token2 })
      .send();
    expect(res2.status).toEqual(200);
    expect(res2.body).toHaveProperty("_id");

    const user2: IUser = (<any>res2).body;

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

    const delProjectRes = await request(app)
      .delete("/api/projects/" + project._id)
      .set({ Authorization: "Bearer " + token2 });

    expect(delProjectRes.status).toBe(403);

    const updatedUser2 = await userController.GetById(user._id);
    expect(updatedUser2.projects.length).toBe(updatedUser.projects.length);
  });
});
