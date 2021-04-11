import { TRoutesInput } from "../../types/routes";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import { logReq, logRes } from "../../middlewares/log.middleware";
import projectController from "../../controllers/project.controller";
import { IProjectDTO } from "../../models/project.model";
import { IKanbanBoardContructor } from "../../models/kanban/kanbanBoard.model";
import kanbanBoardController from "../../controllers/kanban/kanbanBoard.controller";
import { apiRoutes } from "../routeRegistry";
import { IKanbanBoardCardConstructor } from "../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCardController from "../../controllers/kanban/kanbanBoardCard.controller";
import { IKanbanBoardCardCommentConstructor } from "../../models/kanban/kanbanBoardComment.model";
import kanbanBoardCardCommentController from "../../controllers/kanban/kanbanBoardCardComment.controller";

export default ({ app }: TRoutesInput) => {
  /**
   * Post KanbanBoard Comment
   */
  app.post(
    apiRoutes.kanbanboards + "/:id/cards/:cardId/comments",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const boardId = req.params.id;
        const requestedBoard = await kanbanBoardController.GetById(boardId);
        if (!requestedBoard) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project) {
          return res.status(404).send();
        }
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }

        const cardId = req.params.cardId;
        const card = await kanbanBoardCardController.GetById(cardId);
        if (!card) {
          return res.status(404).send();
        }

        const text = req.body.text;
        if (!text) {
          return res.status(400).send();
        }

        const kanbanBoardComment: IKanbanBoardCardCommentConstructor = {
          ownerId: req.user._id,
          cardId: card._id,
          text: text,
        };
        const newComment = await kanbanBoardCardCommentController.Create(
          kanbanBoardComment
        );
        res.status(201).send(newComment);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Card Comments
   */
   app.get(
    apiRoutes.kanbanboards + "/:id/cards/:cardId/comments",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const boardId = req.params.id;
      const requestedBoard = await kanbanBoardController.GetById(boardId);
      if (!requestedBoard) {
        return res.status(404).send();
      }

      const project = await projectController.GetById(requestedBoard.projectId);
      if (!project) {
        return res.status(404).send();
      }
      if (!project.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }

      const cardId = req.params.cardId;
      const card = await kanbanBoardCardController.GetById(cardId);
      if (!card) {
        return res.status(404).send();
      }

      //const commentId = req.params.commentId;
      //const comment = await kanbanBoardCardCommentController.GetById(commentId);
      let comments = await kanbanBoardCardController.GetComments(cardId);

      comments = comments.sort((a: any,b:any) => {
        return b.created - a.created;
      })

      logRes(200, comments);
      return res.status(200).send(comments);
    }
  );

  /**
   * Get Comment By Id
   */
  app.get(
    apiRoutes.kanbanboards + "/:id/cards/:cardId/comments/:commentId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const boardId = req.params.id;
      const requestedBoard = await kanbanBoardController.GetById(boardId);
      if (!requestedBoard) {
        return res.status(404).send();
      }

      const project = await projectController.GetById(requestedBoard.projectId);
      if (!project) {
        return res.status(404).send();
      }
      if (!project.collaborators.includes(req.user._id)) {
        return res.status(403).send();
      }

      const cardId = req.params.cardId;
      const card = await kanbanBoardCardController.GetById(cardId);
      if (!card) {
        return res.status(404).send();
      }

      const commentId = req.params.commentId;
      const comment = await kanbanBoardCardCommentController.GetById(commentId);

      logRes(200, comment);
      return res.status(200).send(comment);
    }
  );

  /**
   * Update Kanban board comment
   */
  app.put(
    apiRoutes.kanbanboards + "/:id/cards/:cardId/comments/:commentId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const boardId = req.params.id;
        const requestedBoard = await kanbanBoardController.GetById(boardId);
        if (!requestedBoard) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project) {
          return res.status(404).send();
        }
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }

        const cardId = req.params.cardId;
        const card = await kanbanBoardCardController.GetById(cardId);
        if (!card) {
          return res.status(404).send();
        }

        const commentId = req.params.commentId;
        const comment = await kanbanBoardCardCommentController.GetById(
          commentId
        );
        if (!comment) {
          return res.status(404).send();
        }
        if(!comment.ownerId.equals(req.user._id)) {
            return res.status(403).send();
        }

        const updates = req.body;

        const updatedComment = await kanbanBoardCardCommentController.Update(
          comment,
          updates
        );
        logRes(200, updatedComment);
        return res.status(200).send(updatedComment);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Card Comment
   */
  app.delete(
    apiRoutes.kanbanboards + "/:id/cards/:cardId/comments/:commentId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const boardId = req.params.id;
        const requestedBoard = await kanbanBoardController.GetById(boardId);
        if (!requestedBoard) {
          return res.status(404).send();
        }

        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project) {
          return res.status(404).send();
        }
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }

        const cardId = req.params.cardId;
        const card = await kanbanBoardCardController.GetById(cardId);
        if (!card) {
          return res.status(404).send();
        }

        const commentId = req.params.commentId;
        const comment = await kanbanBoardCardCommentController.GetById(
          commentId
        );
        if (!comment) {
          return res.status(404).send();
        }
        if(!comment.ownerId.equals(req.user._id)) {
            return res.status(403).send();
        }

        // HERE
        const deletedComment = await kanbanBoardCardCommentController.Delete(
            comment._id
        );
        logRes(200, deletedComment);
        return res.status(200).send(deletedComment);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
};
