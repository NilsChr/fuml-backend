import mongoose from "mongoose";
import KanbanBoardCard, {
  IKanbanBoardCardConstructor,
  IKanbanBoardCardSchema,
  IKanbanBoardCardDTO,
  KanbanBoardCardStatus,
} from "../../models/kanban/kanbanBoardCard.model";
import kanbanBoardComment, {
  IKanbanBoardCardCommentSchema,
} from "../../models/kanban/kanbanBoardComment.model";

function Create(
  kanbanBoardCard: IKanbanBoardCardConstructor
): Promise<IKanbanBoardCardSchema> {
  const card: IKanbanBoardCardDTO = {
    boardId: kanbanBoardCard.boardId,
    title: kanbanBoardCard.title,
    ownerId: kanbanBoardCard.ownerId,
    created: new Date().getTime(),
    completed: null,
    labels: [],
    description: "",
    status: kanbanBoardCard.status || KanbanBoardCardStatus.todo,
    assignees: [kanbanBoardCard.ownerId],
    archived: false,
    hasComments: false
  };
  return KanbanBoardCard.create(card)
    .then(async (data: IKanbanBoardCardSchema) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}
function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await KanbanBoardCard.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IKanbanBoardCardSchema[]> {
  return new Promise(async (resolve, reject) => {
    const cards = await KanbanBoardCard.find();
    return resolve(cards);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<IKanbanBoardCardSchema> {
  return new Promise(async (resolve, reject) => {
    const card = await KanbanBoardCard.findById(id);
    return resolve(card);
  });
}

function GetAllCardsForBoard(
  id: mongoose.Types.ObjectId
): Promise<IKanbanBoardCardSchema[]> {
  return new Promise(async (resolve, reject) => {
    const query = { boardId: id };

    const card = await KanbanBoardCard.find(query);
    return resolve(card);
  });
}

function GetComments(
  cardId: mongoose.Types.ObjectId
): Promise<IKanbanBoardCardCommentSchema[]> {
  return new Promise(async (resolve, reject) => {
    const query = { cardId: cardId };
    const comments = await kanbanBoardComment.find(query);
    return resolve(comments);
  });
}

function Update(
  card: IKanbanBoardCardSchema,
  updates: IKanbanBoardCardDTO
): Promise<IKanbanBoardCardSchema> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        labels: updates.labels,
        description: updates.description,
        status: updates.status,
        assignees: updates.assignees,
        completed: updates.completed,
        archived: updates.archived,
        hasComments: updates.hasComments
      };

      if (sanitizedUpdates.status != KanbanBoardCardStatus.done) {
        sanitizedUpdates.completed = null;
      } else if (
        sanitizedUpdates.status == KanbanBoardCardStatus.done &&
        !sanitizedUpdates.completed
      ) {
        sanitizedUpdates.completed = new Date().getTime();
      }

      const updatedCard = await KanbanBoardCard.findByIdAndUpdate(
        card._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedCard);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const deleted = await KanbanBoardCard.findByIdAndDelete(id);

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
  GetById,
  GetAllCardsForBoard,
  GetComments,
  Update,
  Delete,
};
