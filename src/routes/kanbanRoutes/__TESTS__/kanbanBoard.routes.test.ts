import mongoose from "mongoose";
import request from "supertest";
import testUtil from "../../../controllers/__TESTS__/testUtil";
import testUtilFirebase from "../../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../../index";
import { IKanbanBoardDTO, IKanbanBoardSchema } from "../../../models/kanban/kanbanBoard.model";
import { IProject } from "../../../models/project.model";
import { IUser } from "../../../models/user.model";
import { apiRoutes } from "../../routeRegistry";
import { stubBoard } from "../../../testUtility/stubs/kanbanBoard.stub";
import projectController from "../../../controllers/project.controller";
import kanbanBoardController from "../../../controllers/kanban/kanbanBoard.controller";

describe("Kanban board routes", () => {
  function mockLogin(): Promise<{
    user: IUser;
    token: string;
    project: IProject;
  }> {
    return new Promise(async (resolve) => {
      const token = await testUtilFirebase.loginFirebase();
      const res = await request(app)
        .get("/api/account")
        .set({ Authorization: "Bearer " + token })
        .send();

      const user: IUser = (<any>res).body.user;

      const project = await testUtil.generateRandomProject(user._id);

      resolve({ user, token, project });
    });
  }

  function mockLogin2(): Promise<{
    user2: IUser;
    token2: string;
  }> {
    return new Promise(async (resolve) => {
      const token2 = await testUtilFirebase.loginFirebase2();
      const res = await request(app)
        .get("/api/account")
        .set({ Authorization: "Bearer " + token2 })
        .send();

      const user2: IUser = (<any>res).body.user;

      resolve({ user2, token2 });
    });
  }

  function mockKanbanBody(project: IProject, user: IUser) {
    return {
      projectId: project._id,
      userId: user._id,
      title: testUtil.generateRandomName(),
      backgroundColor: "#000",
      private: false,
    };
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

    const kanbanBody = mockKanbanBody(project, user);

    const postKanbanRes = await request(app)
      .post(apiRoutes.kanbanboards)
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    expect(postKanbanRes.status).toBe(201);
    const kanbanBoard: IKanbanBoardDTO = (<any>postKanbanRes).body;

    expect(kanbanBoard.ownerId).toContain(user._id);
  });

  it("Should connect to app and create a kanban board with custom values", async () => {
    const { user, token, project } = await mockLogin();

    const { board } = await stubBoard(user, project, { title: "custom" });

    expect(board.title).toBe("custom");
  });

  it("Should get board by id", async () => {
    const { user, token, project } = await mockLogin();
    const { board } = await stubBoard(user, project, {});

    const postKanbanRes = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token })
      .send();

    expect(postKanbanRes.status).toBe(200);

    const gotBoard = <any>postKanbanRes.body;
    expect(gotBoard).not.toBe(null);

    const gotBoardId = new mongoose.Types.ObjectId(gotBoard._id);
    const boardId = new mongoose.Types.ObjectId(board._id);

    expect(gotBoardId).toStrictEqual(boardId);
  });

  it("Should try to get board by id and fail since board is private", async () => {
    const { user, token, project } = await mockLogin();
    const { user2, token2 } = await mockLogin2();

    const { board } = await stubBoard(user, project, { private: true });

    const postKanbanRes = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token2 })
      .send();

    expect(postKanbanRes.status).toBe(403);

    await projectController.AddCollaborator(user2, project);

    const postKanbanRes2 = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token2 })
      .send();

    expect(postKanbanRes2.status).toBe(403);
  });

  it("Should try to get board by id and succeed after beeing added to project", async () => {
    const { user, token, project } = await mockLogin();
    const { user2, token2 } = await mockLogin2();

    const { board } = await stubBoard(user, project, { private: false });

    const postKanbanRes = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token2 })
      .send();

    expect(postKanbanRes.status).toBe(403);

    await projectController.AddCollaborator(user2, project);

    const postKanbanRes2 = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token2 })
      .send();

    expect(postKanbanRes2.status).toBe(200);
  });

  it("Should update board", async () => {
    const { user, token, project } = await mockLogin();
    const { board } = await stubBoard(user, project, {});

    const postKanbanRes = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token })
      .send();

    expect(postKanbanRes.status).toBe(200);

    const gotBoard: IKanbanBoardSchema = <any>postKanbanRes.body;
    const newTitle = 'newtitle'
    gotBoard.title = newTitle;

    const putKanbanRes = await request(app)
    .put(apiRoutes.kanbanboards + "/" + board._id)
    .set({ Authorization: "Bearer " + token })
    .send(gotBoard);

    expect(putKanbanRes.status).toBe(200);

    const updatedBoard = await kanbanBoardController.GetById(gotBoard._id);
    expect(updatedBoard.title).toBe(newTitle);
  });

  it("Should fail to update board if not owner", async () => {
    const { user, token, project } = await mockLogin();
    const { board } = await stubBoard(user, project, {});
    const { user2, token2 } = await mockLogin2();

    const postKanbanRes = await request(app)
      .get(apiRoutes.kanbanboards + "/" + board._id)
      .set({ Authorization: "Bearer " + token })
      .send();

    expect(postKanbanRes.status).toBe(200);

    const gotBoard: IKanbanBoardSchema = <any>postKanbanRes.body;
    const newTitle = 'newtitle'
    gotBoard.title = newTitle;

    const putKanbanRes = await request(app)
    .put(apiRoutes.kanbanboards + "/" + board._id)
    .set({ Authorization: "Bearer " + token2 })
    .send(gotBoard);
    
    expect(putKanbanRes.status).toBe(403);
  });


  it("Should delete board", async () => {
    const { user, token, project } = await mockLogin();
    const { board } = await stubBoard(user, project, {});

    const putKanbanRes = await request(app)
    .delete(apiRoutes.kanbanboards + "/" + board._id)
    .set({ Authorization: "Bearer " + token });

    expect(putKanbanRes.status).toBe(200);
  });

  it("Should fail to delete board if not owner", async () => {
    const { user, token, project } = await mockLogin();
    const { board } = await stubBoard(user, project, {});
    const { user2, token2 } = await mockLogin2();


    const putKanbanRes = await request(app)
    .delete(apiRoutes.kanbanboards + "/" + board._id)
    .set({ Authorization: "Bearer " + token2});

    expect(putKanbanRes.status).toBe(403);
  });

});
