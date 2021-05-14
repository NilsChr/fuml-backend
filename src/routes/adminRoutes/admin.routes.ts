import { TRoutesInput } from "../../types/routes";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import { logReq, logRes } from "../../middlewares/log.middleware";

import { apiRoutes } from "../routeRegistry";
import ticketController from "../../controllers/admin/ticket.controller";
import { ITicketDTO } from "../../models/admin/ticket.model";

export default ({ app }: TRoutesInput) => {
  /**
   * Post Ticket
   */
  app.post(
    apiRoutes.admin.tickets,
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const ticketData: ITicketDTO = {
          title: req.body.title,
          userId: req.user._id,
          description: req.body.description,
          created: null,
          lastUpdated: null,
          priority: req.body.priority,
          status: req.body.status,
          seenByAdmin: 0,
          seenByUser: 1,
          version: 1
        };
        const newDoc = await ticketController.Create(ticketData);
        res.status(201).send(newDoc);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );

  /**
   * Get Ticket Document
   */
  app.get(
    apiRoutes.admin.tickets + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const requestedTicket = await ticketController.GetById(req.params.id);
      if (!requestedTicket) {
        return res.status(404).send();
      }

      if (!requestedTicket.userId.equals(req.user._id) && !req.user.isAdmin) {
        return res.status(403).send();
      }

      logRes(200, requestedTicket);
      return res.status(200).send(requestedTicket);
    }
  );

  /**
   * Update Ticket
   */
  app.put(
    apiRoutes.admin.tickets + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedTicket = await ticketController.GetById(req.params.id);
        if (!requestedTicket) {
          return res.status(404).send();
        }

        if (!requestedTicket.userId.equals(req.user._id) && !req.user.isAdmin) {
          return res.status(403).send();
        }

        const updates = req.body;

        const updatedTicket = await ticketController.Update(
          requestedTicket,
          updates
        );
        logRes(200, updatedTicket);
        return res.status(200).send(updatedTicket);
      } catch (e) {
        res.status(500).send();
      }
    }
  );

  /**
   * Delete Ticket
   */
  app.delete(
    apiRoutes.entityDocuments + "/:id",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const requestedDocument = await ticketController.GetById(req.params.id);
        if (!requestedDocument) {
          return res.status(404).send();
        }

        if (!req.user.isAdmin) {
          return res.status(403).send();
        }
        const deletedDocument = await ticketController.Delete(
          requestedDocument._id
        );
        logRes(200, deletedDocument);
        return res.status(200).send(deletedDocument);
      } catch (e) {
        console.log(e);
        res.status(500).send();
      }
    }
  );
};
