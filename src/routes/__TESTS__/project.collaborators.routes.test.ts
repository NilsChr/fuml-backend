import mongoose from "mongoose";
import request from "supertest";
import projectController from "../../controllers/project.controller";
import userController from "../../controllers/user.controller";
import testUtil from "../../controllers/__TESTS__/testUtil";
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
    await userController.Flush();
    await projectController.Flush();
  });

  it("Should connect to app and create a project and get collaborators", async () => {
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

    const getCollaboratos = await request(app)
      .get("/api/projects/" + project._id + "/collaborators")
      .set({ Authorization: "Bearer " + token });

    expect(project.collaborators.length).toBe(getCollaboratos.body.length);
  });

  /*
  it("Should connect to app and create a project and add a collaborator", async () => {
    const userToAdd = await testUtil.generateRandomUser();

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

    const postCollaboratorRes = await request(app)
      .post("/api/projects/" + project._id + "/collaborators")
      .set({ Authorization: "Bearer " + token })
      .send({ _id: userToAdd._id });

    expect(postCollaboratorRes.status).toBe(201);

    const updatedUserToAdd = await userController.GetById(userToAdd._id);
    const mId = mongoose.Types.ObjectId(project._id);
    expect(updatedUserToAdd.projects).toContainEqual(mId);


    const postCollaboratorRes2 = await request(app)
    .get("/api/projects/" + project._id + "/collaborators")
    .set({ Authorization: "Bearer " + token });

    expect(postCollaboratorRes2.body.length).toBe(2);
  });

  it("Should connect to app and create a project and add a collaborator then remove it", async () => {
    const userToAdd = await testUtil.generateRandomUser();

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

    const postCollaboratorRes = await request(app)
      .post("/api/projects/" + project._id + "/collaborators")
      .set({ Authorization: "Bearer " + token })
      .send({ _id: userToAdd._id });

    expect(postCollaboratorRes.status).toBe(201);

    const updatedUserToAdd = await userController.GetById(userToAdd._id);
    const mId = mongoose.Types.ObjectId(project._id);
    expect(updatedUserToAdd.projects).toContainEqual(mId);

    const deleteCollaboratorRes = await request(app)
      .delete(
        "/api/projects/" +
          project._id +
          "/collaborators/" +
          updatedUserToAdd._id
      )
      .set({ Authorization: "Bearer " + token });

    expect(deleteCollaboratorRes.status).toBe(200);

    const updatedUserToAdd2 = await userController.GetById(userToAdd._id);
    expect(updatedUserToAdd2.projects).not.toContainEqual(mId);
  });

  it("Should try to get project collaborators with unauthorized user and get 403", async () => {

    const token = await testUtilFirebase.loginFirebase();
    const token2 = await testUtilFirebase.loginFirebase2();

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

    const getCollaboratorRes = await request(app)
      .get("/api/projects/" + project._id + "/collaborators")
      .set({ Authorization: "Bearer " + token2 });
    expect(getCollaboratorRes.status).toBe(403);

  });

  */
});
