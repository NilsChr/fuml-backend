import mongoose from "mongoose";
import projectController from "../../project.controller";
import userController from "../../user.controller";
import kanbanBoardController from "../kanbanBoard.controller";
import testUtil from "../../__TESTS__/testUtil";
import {
  IKanbanBoardContructor,
  IKanbanBoardSchema,
} from "../../../models/kanban/kanbanBoard.model";
import { IProject } from "../../../models/project.model";
import { IUser } from "../../../models/user.model";
import kanbanBoardCardController from "../kanbanBoardCard.controller";
import { IKanbanBoardCardConstructor, IKanbanBoardCardSchema } from "../../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCardCommentController from "../kanbanBoardCardComment.controller";
import { IKanbanBoardCardCommentConstructor } from "../../../models/kanban/kanbanBoardComment.model";
describe("Entity Document Controller", () => {
  function createDummyCard(): Promise<{
    user: IUser,
    project: IProject,
    board: IKanbanBoardSchema,
    card: IKanbanBoardCardSchema,
  }> {
    return new Promise(async (resolve) => {
      const user = await testUtil.generateRandomUser();
      const project = await testUtil.generateRandomProject(user._id);

      const constructor: IKanbanBoardContructor = {
        ownerId: user._id,
        projectId: project._id,
        backgroundColor: "",
        private: false,
        title: testUtil.generateRandomName(),
      };
      const board = await kanbanBoardController.Create(constructor);

      const constructorCard: IKanbanBoardCardConstructor = {
        boardId: board._id,
        ownerId: user._id,
        description: testUtil.generateRandomName(),
        title: testUtil.generateRandomName(),
      };
      const card = await kanbanBoardCardController.Create(constructorCard);

  
      return resolve({ user, project, board, card });
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
  });

  beforeEach(async () => {
    await userController.Flush();
    await projectController.Flush();
    await kanbanBoardController.Flush();
  });

  it("Should create a kanban board card comment", async () => {
    const { user, board,card } = await createDummyCard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardCommentConstructor = {
      cardId: card._id,
      ownerId: user._id,
      text: testUtil.generateRandomName()
    };

    const comment = await kanbanBoardCardCommentController.Create(constructor);

    expect(comment).not.toBeNull();
    expect(comment.text.length).toBeGreaterThan(0);
    expect(comment.cardId).toStrictEqual(card._id);
    expect(comment.ownerId).toStrictEqual(user._id);
  });

  it("Should get a kanban board card comment by ID", async () => {
    const { user, board,card } = await createDummyCard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardCommentConstructor = {
      cardId: card._id,
      ownerId: user._id,
      text: testUtil.generateRandomName()
    };

    const comment = await kanbanBoardCardCommentController.Create(constructor);

    const gotComment = await kanbanBoardCardCommentController.GetById(comment._id);
    expect(gotComment).not.toBeNull();
  });

  
  it("Should update a kanban board card", async () => {
    const { user, board,card } = await createDummyCard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardCommentConstructor = {
      cardId: card._id,
      ownerId: user._id,
      text: testUtil.generateRandomName()
    };

    const comment = await kanbanBoardCardCommentController.Create(constructor);

    const newText = testUtil.generateRandomName();
    comment.text = newText;

    const updatedComment = await kanbanBoardCardCommentController.Update(comment, comment);
    expect(updatedComment.text).toBe(newText);
  });

  it("Should delete a kanban board card", async () => {
    const { user, board,card } = await createDummyCard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardCommentConstructor = {
      cardId: card._id,
      ownerId: user._id,
      text: testUtil.generateRandomName()
    };

    const comment = await kanbanBoardCardCommentController.Create(constructor);

    await kanbanBoardCardCommentController.Delete(comment._id);

    const commentAfter = await kanbanBoardCardCommentController.GetById(comment._id);
    expect(commentAfter).toBeNull();
  });
  
});
