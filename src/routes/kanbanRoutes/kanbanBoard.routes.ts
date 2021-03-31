import { TRoutesInput } from "../../types/routes";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import { logReq, logRes } from "../../middlewares/log.middleware";
import projectController from "../../controllers/project.controller";
import { IProjectDTO } from "../../models/project.model";
import { IKanbanBoardContructor } from "../../models/kanban/kanbanBoard.model";
import kanbanBoardController from "../../controllers/kanban/kanbanBoard.controller";
import { apiRoutes } from "../routeRegistry";

export default ({ app }: TRoutesInput) => {
  /**
   * Post KanbanBoard
   */
  app.post(
    apiRoutes.kanbanboards,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const project = await projectController.GetById(req.body.projectId);
        if (!project) {
          return res.status(404).send();
        }
        const kanbanBoard: IKanbanBoardContructor = {
          projectId: project._id,
          ownerId: req.user._id,
          title: req.body.title,
          backgroundColor: req.body.backgroundColor,
          private: req.body.private,
        };
        const newBoard = await kanbanBoardController.Create(kanbanBoard);
        res.status(201).send(newBoard);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Board By Id
   */
  app.get(
    apiRoutes.kanbanboards + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedBoard = await kanbanBoardController.GetById(req.params.id);
      if (!requestedBoard) {
        return res.status(404).send();
      }

      const project = await projectController.GetById(requestedBoard.projectId);
      if (!project.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }

      if (
        !requestedBoard.ownerId.equals(req.user._id) &&
        requestedBoard.private
      ) {
        return res.status(403).send();
      }

      logRes(200, requestedBoard);
      return res.status(200).send(requestedBoard);
    }
  );

  /**
   * Update Kanban board
   */
  app.put(
    apiRoutes.kanbanboards + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedBoard = await kanbanBoardController.GetById(
          req.params.id
        );
        if (!requestedBoard) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }

        if (
          !requestedBoard.ownerId.equals(req.user._id) &&
          requestedBoard.private
        ) {
          return res.status(403).send();
        }

        const updates = req.body;

        const updatedBoard = await kanbanBoardController.Update(
          requestedBoard,
          updates
        );
        logRes(200, updatedBoard);
        return res.status(200).send(updatedBoard);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Kanban Board
   */
  app.delete(
    apiRoutes.kanbanboards + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedBoard = await kanbanBoardController.GetById(
          req.params.id
        );
        if (!requestedBoard) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }

        if (!requestedBoard.ownerId.equals(req.user._id)) {
          return res.status(403).send();
        }

        const deletedBoard = await kanbanBoardController.Delete(
          requestedBoard._id
        );
        logRes(200, deletedBoard);
        return res.status(200).send(deletedBoard);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
};
