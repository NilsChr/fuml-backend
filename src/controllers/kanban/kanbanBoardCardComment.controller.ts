import mongoose from "mongoose";
import KanbanBoardCardComment, {
  IKanbanBoardCardCommentConstructor,
  IKanbanBoardCardCommentDTO,
  IKanbanBoardCardCommentSchema,
} from "../../models/kanban/kanbanBoardComment.model";

function Create(
  kanbanBoardCardComment: IKanbanBoardCardCommentConstructor
): Promise<IKanbanBoardCardCommentSchema> {
  const comment: IKanbanBoardCardCommentDTO = {
    cardId: kanbanBoardCardComment.cardId,
    ownerId: kanbanBoardCardComment.ownerId,
    text: kanbanBoardCardComment.text,
    created: new Date().getTime(),
  };
  return KanbanBoardCardComment.create(comment)
    .then(async (data: IKanbanBoardCardCommentSchema) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}
function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await KanbanBoardCardComment.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IKanbanBoardCardCommentSchema[]> {
  return new Promise(async (resolve, reject) => {
    const comments = await KanbanBoardCardComment.find();
    return resolve(comments);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<IKanbanBoardCardCommentSchema> {
  return new Promise(async (resolve, reject) => {
    const comment = await KanbanBoardCardComment.findById(id);
    return resolve(comment);
  });
}

function Update(
  comment: IKanbanBoardCardCommentSchema,
  updates: IKanbanBoardCardCommentDTO
): Promise<IKanbanBoardCardCommentSchema> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        text: updates.text
      };

      const updatedComment = await KanbanBoardCardComment.findByIdAndUpdate(
        comment._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedComment);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const deleted = await KanbanBoardCardComment.findByIdAndDelete(id);

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
  Update,
  Delete,
};
