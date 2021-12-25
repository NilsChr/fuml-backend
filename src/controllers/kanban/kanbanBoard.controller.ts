import mongoose from "mongoose";
import KanbanBoard, {
  IKanbanBoardContructor,
  IKanbanBoardDTO,
  IKanbanBoardSchema,
} from "../../models/kanban/kanbanBoard.model";
import kanbanBoardCardModel, {
  IKanbanBoardCardSchema,
} from "../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCommentModel from "../../models/kanban/kanbanBoardComment.model";

function Create(
  kanbanBoard: IKanbanBoardContructor
): Promise<IKanbanBoardSchema> {
  const board: IKanbanBoardDTO = {
    title: kanbanBoard.title,
    ownerId: kanbanBoard.ownerId,
    projectId: kanbanBoard.projectId,
    created: new Date().getTime(),
    backgroundColor: kanbanBoard.backgroundColor,
    labels: [],
    private: kanbanBoard.private,
    cardsTodo: 0,
    cardsDone: 0,
    cardsInProgress: 0,
    cardsPending: 0
  };
  return KanbanBoard.create(board)
    .then(async (data: IKanbanBoardSchema) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}
function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await KanbanBoard.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IKanbanBoardSchema[]> {
  return new Promise(async (resolve, reject) => {
    const boards = await KanbanBoard.find();
    return resolve(boards);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<IKanbanBoardSchema> {
  return new Promise(async (resolve, reject) => {
    const board = await KanbanBoard.findById(id);
    return resolve(board);
  });
}

function GetAllProjectBoards(projectId: mongoose.Types.ObjectId): Promise<IKanbanBoardSchema[]>  {
    return new Promise(async (resolve, reject) => {
        const query = { projectId: projectId };
        const boards = await KanbanBoard.find(query);
        return resolve(boards);
      });
}

function GetCards(
  id: mongoose.Types.ObjectId
): Promise<IKanbanBoardCardSchema[]> {
  return new Promise(async (resolve, reject) => {
    const query = { boardId: id };
    const cards = await kanbanBoardCardModel.find(query);
    return resolve(cards);
  });
}

function Update(
  board: IKanbanBoardSchema,
  updates: IKanbanBoardDTO
): Promise<IKanbanBoardSchema> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        backgroundColor: updates.backgroundColor,
        labels: updates.labels,
        cardsTodo: updates.cardsTodo,
        cardsPending:  updates.cardsPending,
        cardsInProgress:  updates.cardsInProgress,
        cardsDone:  updates.cardsDone,
      };

      const updatedBoard = await KanbanBoard.findByIdAndUpdate(
        board._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedBoard);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {

      // Find cards
      const cards = await kanbanBoardCardModel.find({boardId: id});
      cards.forEach(async (card) => {
        console.log('Deleteing card', card._id)
        // Find and delete comments
        const comments = await kanbanBoardCommentModel.find({cardId: card._id});
        comments.forEach(async (comment) => {
            await kanbanBoardCommentModel.findByIdAndDelete(comment._id);
        })

        console.log('Deleted comments');

        await kanbanBoardCardModel.findByIdAndDelete(card._id);
      })

      const deleted = await KanbanBoard.findByIdAndDelete(id);

      resolve(deleted != null);
    } catch (e) {
      reject(e);
    }
  });
}
export default {
  Create,
  Flush,
  Get,
  GetAllProjectBoards,
  GetById,
  GetCards,
  Update,
  Delete,
};
