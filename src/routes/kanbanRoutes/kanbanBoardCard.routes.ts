import { TRoutesInput } from "../../types/routes";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import { logReq, logRes } from "../../middlewares/log.middleware";
import projectController from "../../controllers/project.controller";
import { IProjectDTO } from "../../models/project.model";
import { IKanbanBoardContructor } from "../../models/kanban/kanbanBoard.model";
import kanbanBoardController from "../../controllers/kanban/kanbanBoard.controller";
import { apiRoutes } from "../routeRegistry";
import { IKanbanBoardCardConstructor, KanbanBoardCardStatus } from "../../models/kanban/kanbanBoardCard.model";
import kanbanBoardCardController from "../../controllers/kanban/kanbanBoardCard.controller";

export default ({ app }: TRoutesInput) => {
  /**
   * Post KanbanBoard Cards
   */
  app.post(
    apiRoutes.kanbanboards + "/:id/cards",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
          console.log('POST CARDS')
          console.log(req.params.id);
        const requestedBoard = await kanbanBoardController.GetById(
          req.params.id
        );
        if (!requestedBoard) {
          return res.status(404).send();
        }
        console.log('1');
        const project = await projectController.GetById(
          requestedBoard.projectId
        );
        if (!project) {
          return res.status(404).send();
        }
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
        console.log('2');

        const title = req.body.title;
        if (!title) {
          return res.status(400).send();
        }
        /*const description = req.body.description;
        if (!description) {
          return res.status(400).send();
        }*/
        console.log('3');

        const status = req.body.status;

        const kanbanBoardCard: IKanbanBoardCardConstructor = {
          boardId: requestedBoard._id,
          ownerId: req.user._id,
          title: title,
          description: '',
          status: status || KanbanBoardCardStatus.todo
        };
        const newCard = await kanbanBoardCardController.Create(kanbanBoardCard);
        res.status(201).send(newCard);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Cards By Board
   */
   app.get(
    apiRoutes.kanbanboards + "/:id/cards",
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

      const requestedCards = await kanbanBoardCardController.GetAllCardsForBoard(requestedBoard._id);
      if (!requestedCards) {
        return res.status(404).send();
      }

      logRes(200, requestedCards);
      return res.status(200).send(requestedCards);
    }
  );

  /**
   * Get Card By Id
   */
  app.get(
    apiRoutes.kanbanboards + "/:id/cards/:cardId",
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

      const cardId = req.params.cardId;
      const requestedCard = await kanbanBoardCardController.GetById(cardId);
      if (!requestedCard) {
        return res.status(404).send();
      }

      logRes(200, requestedCard);
      return res.status(200).send(requestedCard);
    }
  );

  /**
   * Update Kanban board
   */
  app.put(
    apiRoutes.kanbanboards + "/:id/cards/:cardId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedBoard = await kanbanBoardController.GetById(req.params.id);
        if (!requestedBoard) {
          return res.status(404).send();
        }
  
        const project = await projectController.GetById(requestedBoard.projectId);
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
  
        const cardId = req.params.cardId;
        const requestedCard = await kanbanBoardCardController.GetById(cardId);
        if (!requestedCard) {
          return res.status(404).send();
        }

        const updates = req.body;

        const updatedCard = await kanbanBoardCardController.Update(
            requestedCard,
          updates
        );
        logRes(200, updatedCard);
        return res.status(200).send(updatedCard);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Entity Document
   */
  app.delete(
    apiRoutes.kanbanboards + "/:id/cards/:cardId",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedBoard = await kanbanBoardController.GetById(req.params.id);
        if (!requestedBoard) {
          return res.status(404).send();
        }
  
        const project = await projectController.GetById(requestedBoard.projectId);
        if (!project.collaborators.includes(req.user._id)) {
          return res.status(403).send();
        }
  
        const cardId = req.params.cardId;
        const requestedCard = await kanbanBoardCardController.GetById(cardId);
        if (!requestedCard) {
          return res.status(404).send();
        }

        const deletedCard = await kanbanBoardCardController.Delete(
            requestedCard._id
        );
        logRes(200, deletedCard);
        return res.status(200).send(deletedCard);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
};
