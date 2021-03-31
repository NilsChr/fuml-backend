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
import { IKanbanBoardCardConstructor } from "../../../models/kanban/kanbanBoardCard.model";
import { IKanbanBoardCardCommentConstructor, IKanbanBoardCardCommentSchema } from "../../../models/kanban/kanbanBoardComment.model";
import kanbanBoardCardCommentController from "../kanbanBoardCardComment.controller";
describe("Entity Document Controller", () => {
  function createDummyBoard(): Promise<{
    user: IUser;
    project: IProject;
    board: IKanbanBoardSchema;
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
      return resolve({ user, project, board });
    });
  }

  function createDummyComment(cardId: mongoose.Types.ObjectId,ownerId: mongoose.Types.ObjectId): Promise<IKanbanBoardCardCommentSchema> {
      return new Promise(async (resolve) => {
          const constructor: IKanbanBoardCardCommentConstructor = {
            cardId: cardId,
            ownerId: ownerId,
            text: testUtil.generateRandomName()
          } 
        const comment = await kanbanBoardCardCommentController.Create(constructor)
        resolve(comment);
      })
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

  it("Should create a kanban board card", async () => {
    const { user, board } = await createDummyBoard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card = await kanbanBoardCardController.Create(constructor);

    expect(card).not.toBeNull();
    expect(card.assignees.length).toBe(0);
    expect(card.labels.length).toBe(0);
    expect(card.created).not.toBe(undefined);
  });

  
  it("Should get a kanban board card by ID", async () => {
    const { user, board } = await createDummyBoard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card = await kanbanBoardCardController.Create(constructor);

    const gotCard = await kanbanBoardCardController.GetById(card._id);
    expect(gotCard).not.toBeNull();
  });

  
  it("Should update a kanban board card", async () => {
    const { user, board } = await createDummyBoard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card = await kanbanBoardCardController.Create(constructor);

    const newtitle = 'newtitle'
    card.title = newtitle;
    
    const updatedCard = await kanbanBoardCardController.Update(card, card);

    expect(updatedCard.title).toBe(newtitle);
  });

  it("Should delete a kanban board card", async () => {
      const { user, board } = await createDummyBoard();

    expect(board).not.toBeNull();
    expect(board.created).not.toBe(undefined);
    expect(board.labels.length).toBe(0);

    const constructor: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card = await kanbanBoardCardController.Create(constructor);
    expect(card).not.toBeNull();

    await kanbanBoardCardController.Delete(card._id);

    const cardAfter = await kanbanBoardCardController.GetById(card._id);
    expect(cardAfter).toBeNull();

  });
  
  it("Should create a kanban board card, add comments then get all comments for specific card", async () => {
    const { user, board } = await createDummyBoard();

    const constructor: IKanbanBoardCardConstructor = {
      boardId: board._id,
      ownerId: user._id,
      description: testUtil.generateRandomName(),
      title: testUtil.generateRandomName(),
    };

    const card1 = await kanbanBoardCardController.Create(constructor);
    const comment1 = await createDummyComment(card1._id, user._id);
    const comment2 = await createDummyComment(card1._id, user._id);

    const card1Comments = await kanbanBoardCardController.GetComments(card1._id);

    expect(card1Comments.length).toBe(2);

    const card2 = await kanbanBoardCardController.Create(constructor);
    const card2Comments = await kanbanBoardCardController.GetComments(card2._id);

    expect(card2Comments.length).toBe(0);
  })
});
