import kanbanBoardController from "../../controllers/kanban/kanbanBoard.controller";
import testUtil from "../../controllers/__TESTS__/testUtil";
import {
  IKanbanBoardContructor,
  IKanbanBoardSchema,
} from "../../models/kanban/kanbanBoard.model";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";

export function stubBoard(
  user: IUser,
  project: IProject,
  opts: any
): Promise<{
  board: IKanbanBoardSchema;
}> {
  return new Promise(async (resolve) => {
    const constructor: IKanbanBoardContructor = {
      ownerId: user._id,
      projectId: project._id,
      backgroundColor: opts.backgroundColor || "",
      private: opts.private || false,
      title: opts.title || testUtil.generateRandomName(),
    };
    const board = await kanbanBoardController.Create(constructor);

    return resolve({ board });
  });
}
