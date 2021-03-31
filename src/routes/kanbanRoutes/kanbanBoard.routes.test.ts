import mongoose from "mongoose";
import request from "supertest";
import userController from "../../controllers/user.controller";
import testUtil from "../../controllers/__TESTS__/testUtil";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IKanbanBoardDTO } from "../../models/kanban/kanbanBoard.model";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";

describe("User routes", () => {
  function mockLogin(): Promise<{ user: IUser; token: string, project: IProject }> {
    return new Promise(async (resolve) => {
      const token = await testUtilFirebase.loginFirebase();
      const res = await request(app)
        .get("/api/account")
        .set({ Authorization: "Bearer " + token })
        .send();

      const user: IUser = (<any>res).body;

      const project = await testUtil.generateRandomProject(user._id);

      resolve({ user, token, project });
    });
  }

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

  it("Should connect to app and create a kanban board", async () => {
    const { user, token, project } = await mockLogin();

    const kanbanBody = {
        projectId: project._id,
        userId: user._id,
        title: testUtil.generateRandomName(),
        backgroundColor: '#000',
        private: false
    }

    const postKanbanRes = await request(app)
      .post("/api/kanbanboards")
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    expect(postKanbanRes.status).toBe(201);
    const kanbanBoard: IKanbanBoardDTO = (<any>postKanbanRes).body;

    expect(kanbanBoard.ownerId).toContain(user._id);
  });
/*
  it("Should get board by id", async () => {
    fail();
  });

  it("Should update board", async () => {
    fail();
  });

  it("Should delete board", async () => {
    fail();
  });
  */
});
