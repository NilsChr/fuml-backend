import mongoose, { now } from "mongoose";
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
import { IKanbanBoardCardSchema } from "../../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCardCommentController from "../../../controllers/kanban/kanbanBoardCardComment.controller";
import { IKanbanBoardCardCommentDTO } from "../../../models/kanban/kanbanBoardComment.model";

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

      const user: IUser = (<any>res).body;

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

      const user2: IUser = (<any>res).body;

      resolve({ user2, token2 });
    });
  }

  function stubBoardWithCard(): Promise<{
    user: IUser;
    token: string;
    board: IKanbanBoardSchema;
    card: IKanbanBoardCardSchema;
  }> {
    return new Promise(async (resolve) => {
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

      const kanbanBoardCard: IKanbanBoardCardSchema = (<any>postKanbanCard)
        .body;

      return resolve({
        user,
        token,
        board: kanbanBoard,
        card: kanbanBoardCard,
      });
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

  it("Should create a kanban board card comment", async () => {
    const { user, token, board, card } = await stubBoardWithCard();

    const commentBody = {
      text: testUtil.generateRandomName(),
    };

    const url = "/" + board._id + "/cards/" + card._id + "/comments";
    const postCommentRes = await request(app)
      .post(apiRoutes.kanbanboards + url)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);

    expect(postCommentRes.status).toBe(201);

    const cardCheck = await kanbanBoardCardCommentController.GetById(
      postCommentRes.body._id
    );
    expect(cardCheck).not.toBeNull();
    const ownerId = new mongoose.Types.ObjectId(cardCheck.ownerId);
    const userId = new mongoose.Types.ObjectId(user._id);
    expect(ownerId).toStrictEqual(userId);
    expect(cardCheck.text).not.toBe(undefined);
    expect(cardCheck.created).not.toBe(undefined);
  });

  it("Should get a comment by id", async () => {
    const { user, token, board, card } = await stubBoardWithCard();

    const commentBody = {
      text: testUtil.generateRandomName(),
    };

    const url = "/" + board._id + "/cards/" + card._id + "/comments";
    const postCommentRes = await request(app)
      .post(apiRoutes.kanbanboards + url)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);

    expect(postCommentRes.status).toBe(201);

    const url2 =
      "/" +
      board._id +
      "/cards/" +
      card._id +
      "/comments/" +
      postCommentRes.body._id;
    const getCommentRes = await request(app)
      .get(apiRoutes.kanbanboards + url2)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);

    expect(getCommentRes.status).toBe(200);
    expect(getCommentRes.body._id).toBe(postCommentRes.body._id);
  });

  it("Should update a comment", async () => {
    const { user, token, board, card } = await stubBoardWithCard();

    const commentBody = {
      text: testUtil.generateRandomName(),
    };

    const url = "/" + board._id + "/cards/" + card._id + "/comments";
    const postCommentRes = await request(app)
      .post(apiRoutes.kanbanboards + url)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);
    const comment: IKanbanBoardCardCommentDTO = (<any>postCommentRes).body;

    const newText = "newtext";
    comment.text = newText;

    const putCommentRes = await request(app)
      .put(apiRoutes.kanbanboards + url + "/" + postCommentRes.body._id)
      .set({ Authorization: "Bearer " + token })
      .send(comment);

    expect(putCommentRes.status).toBe(200);

    const cardCheck = await kanbanBoardCardCommentController.GetById(
      postCommentRes.body._id
    );
    expect(cardCheck.text).toBe(newText);
  });

  it("Should fail to update a comment with wrong user", async () => {
    const { user, token, board, card } = await stubBoardWithCard();
    const { token2 } = await mockLogin2();
    const commentBody = {
      text: testUtil.generateRandomName(),
    };

    const url = "/" + board._id + "/cards/" + card._id + "/comments";
    const postCommentRes = await request(app)
      .post(apiRoutes.kanbanboards + url)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);
    const comment: IKanbanBoardCardCommentDTO = (<any>postCommentRes).body;

    const newText = "newtext";
    comment.text = newText;

    const putCommentRes = await request(app)
      .put(apiRoutes.kanbanboards + url + "/" + postCommentRes.body._id)
      .set({ Authorization: "Bearer " + token2 })
      .send(comment);

    expect(putCommentRes.status).toBe(403);

  });

  it("Should delete a comment", async () => {
    const { user, token, board, card } = await stubBoardWithCard();

    const commentBody = {
      text: testUtil.generateRandomName(),
    };

    const url = "/" + board._id + "/cards/" + card._id + "/comments";
    const postCommentRes = await request(app)
      .post(apiRoutes.kanbanboards + url)
      .set({ Authorization: "Bearer " + token })
      .send(commentBody);
    const comment: IKanbanBoardCardCommentDTO = (<any>postCommentRes).body;

    const newText = "newtext";
    comment.text = newText;

    const putCommentRes = await request(app)
      .delete(apiRoutes.kanbanboards + url + "/" + postCommentRes.body._id)
      .set({ Authorization: "Bearer " + token })
      .send(comment);

    expect(putCommentRes.status).toBe(200);

    const cardCheck = await kanbanBoardCardCommentController.GetById(
      postCommentRes.body._id
    );
    expect(cardCheck).toBe(null);
  });
});
