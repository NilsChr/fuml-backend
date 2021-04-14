import mongoose from "mongoose";
import request from "supertest";
import testUtil from "../../../controllers/__TESTS__/testUtil";
import testUtilFirebase from "../../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../../index";
import KanbanBoardSchema, {
  IKanbanBoardDTO,
  IKanbanBoardSchema,
} from "../../../models/kanban/kanbanBoard.model";
import { IProject } from "../../../models/project.model";
import { IUser } from "../../../models/user.model";
import { apiRoutes } from "../../routeRegistry";
import { stubBoard } from "../../../testUtility/stubs/kanbanBoard.stub";
import projectController from "../../../controllers/project.controller";
import kanbanBoardController from "../../../controllers/kanban/kanbanBoard.controller";
import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import kanbanBoardCardController from "../../../controllers/kanban/kanbanBoardCard.controller";
import userController from "../../../controllers/user.controller";

describe("Kanban board card routes", () => {
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
    await userController.Flush();

    await projectController.Flush();
    await kanbanBoardController.Flush();
    await kanbanBoardCardController.Flush();
  });

  it("Should connect to app and create a kanban board card", async () => {
    const { user, token, project } = await mockLogin();

    const kanbanBody = mockKanbanBody(project, user);

    const postKanbanRes = await request(app)
      .post(apiRoutes.kanbanboards)
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    expect(postKanbanRes.status).toBe(201);
    const kanbanBoard: IKanbanBoardSchema = (<any>postKanbanRes).body;

    const cardBody = {
      title: testUtil.generateRandomName(),
      description: testUtil.generateRandomName(),
    };

    const postKanbanCard = await request(app)
      .post(apiRoutes.kanbanboards + "/" + kanbanBoard._id + "/cards")
      .set({ Authorization: "Bearer " + token })
      .send(cardBody);

    expect(postKanbanCard.status).toBe(201);

    const boardCards = await kanbanBoardController.GetCards(kanbanBoard._id);
    expect(boardCards.length).toBe(1);
  });

  it("Should get a card by id", async () => {
    const { user, token, project } = await mockLogin();
    const kanbanBody = mockKanbanBody(project, user);
    const postKanbanRes = await request(app)
      .post(apiRoutes.kanbanboards)
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    const kanbanBoard: IKanbanBoardSchema = (<any>postKanbanRes).body;

    const cardBody = {
      title: testUtil.generateRandomName(),
      description: testUtil.generateRandomName(),
    };

    const postKanbanCardRes = await request(app)
      .post(apiRoutes.kanbanboards + "/" + kanbanBoard._id + "/cards")
      .set({ Authorization: "Bearer " + token })
      .send(cardBody);

    const kanbanBoardCard: IKanbanBoardSchema = (<any>postKanbanCardRes).body;

    const getKanbanCardRes = await request(app)
      .get(
        apiRoutes.kanbanboards +
          "/" +
          kanbanBoard._id +
          "/cards/" +
          kanbanBoardCard._id
      )
      .set({ Authorization: "Bearer " + token });

    expect(getKanbanCardRes.status).toBe(200);
  });

  it("Should update a card", async () => {
    const { user, token, project } = await mockLogin();
    const kanbanBody = mockKanbanBody(project, user);
    const postKanbanRes = await request(app)
      .post(apiRoutes.kanbanboards)
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    const kanbanBoard: IKanbanBoardSchema = (<any>postKanbanRes).body;

    const cardBody = {
      title: testUtil.generateRandomName(),
      description: testUtil.generateRandomName(),
    };

    const postKanbanCardRes = await request(app)
      .post(apiRoutes.kanbanboards + "/" + kanbanBoard._id + "/cards")
      .set({ Authorization: "Bearer " + token })
      .send(cardBody);

    const kanbanBoardCard: IKanbanBoardSchema = (<any>postKanbanCardRes).body;
    const newtitle = "newtitle";
    kanbanBoardCard.title = newtitle;

    const putKanbanCardRes = await request(app)
      .put(
        apiRoutes.kanbanboards +
          "/" +
          kanbanBoard._id +
          "/cards/" +
          kanbanBoardCard._id
      )
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBoardCard);

    expect(putKanbanCardRes.status).toBe(200);
  });

  it("Should delete a card", async () => {
    const { user, token, project } = await mockLogin();
    const kanbanBody = mockKanbanBody(project, user);
    const postKanbanRes = await request(app)
      .post(apiRoutes.kanbanboards)
      .set({ Authorization: "Bearer " + token })
      .send(kanbanBody);

    const kanbanBoard: IKanbanBoardSchema = (<any>postKanbanRes).body;

    const cardBody = {
      title: testUtil.generateRandomName(),
      description: testUtil.generateRandomName(),
    };

    const postKanbanCardRes = await request(app)
      .post(apiRoutes.kanbanboards + "/" + kanbanBoard._id + "/cards")
      .set({ Authorization: "Bearer " + token })
      .send(cardBody);

    const kanbanBoardCard: IKanbanBoardSchema = (<any>postKanbanCardRes).body;

    const allCards = await kanbanBoardCardController.Get();
    expect(allCards.length).toBe(1);

    const deleteKanbanCardRes = await request(app)
      .delete(
        apiRoutes.kanbanboards +
          "/" +
          kanbanBoard._id +
          "/cards/" +
          kanbanBoardCard._id
      )
      .set({ Authorization: "Bearer " + token });
    expect(deleteKanbanCardRes.status).toBe(200);

    const allCards2 = await kanbanBoardCardController.Get();
    expect(allCards2.length).toBe(0);
  });
});
