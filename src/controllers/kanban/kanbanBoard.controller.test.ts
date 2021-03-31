import mongoose from "mongoose";
import projectController from "../project.controller";
import userController from "../user.controller";
import kanbanBoardController from "./kanbanBoard.controller";
import testUtil from "../__TESTS__/testUtil";
import { IKanbanBoardContructor } from "../../models/kanban/kanbanBoard.model";
import { IKanbanBoardCardConstructor } from "../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCardController from "./kanbanBoardCard.controller";
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
    await kanbanBoardController.Flush();
  });

  it("Should create a kanban board", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: "",
      private: false,
      title: "first board",
    };

    const board = await kanbanBoardController.Create(constructor);

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);
  });

  it("Should get board by ID", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: "",
      private: false,
      title: "first board",
    };

    const board = await kanbanBoardController.Create(constructor);

    const gotBoard = await kanbanBoardController.GetById(board._id);

    expect(board._id).toStrictEqual(gotBoard._id);
  });

  it("Should update board", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: "",
      private: false,
      title: "first board",
    };

    const board = await kanbanBoardController.Create(constructor);
    const newtitle = "update";
    board.title = newtitle;
    const updatedBoard = await kanbanBoardController.Update(board, board);

    expect(updatedBoard.title).toStrictEqual(newtitle);
  });

  it("Should delete a board", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: "",
      private: false,
      title: "first board",
    };

    const board = await kanbanBoardController.Create(constructor);
    const boards = await kanbanBoardController.Get();
    expect(boards.length).toBe(1);
    await kanbanBoardController.Delete(board._id);
    const boardsAfter = await kanbanBoardController.Get();
    expect(boardsAfter.length).toBe(0);
  });

  it("Should create a kanban board, add cards, then get them all", async () => {
    const user = await testUtil.generateRandomUser();
    const project = await testUtil.generateRandomProject(user._id);

    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: "",
      private: false,
      title: "first board",
    };

    const board = await kanbanBoardController.Create(constructor);

    const constructorCard: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card = await kanbanBoardCardController.Create(constructorCard);

    const boardCards = await kanbanBoardController.GetCards(board._id);
    expect(boardCards.length).toBe(1);
  });
});
