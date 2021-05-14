import mongoose from "mongoose";
import Ticket, { ITicketDTO, ITicket } from "../../models/admin/ticket.model";

function Create(ticket: ITicketDTO): Promise<ITicket> {
  const newTicket: ITicketDTO = {
    created: new Date().getTime(),
    description: ticket.description,
    lastUpdated: new Date().getTime(),
    priority: 0,
    status: ticket.status,
    title: ticket.title,
    userId: ticket.userId,
    seenByAdmin: 0,
    seenByUser: 1,
    version: 1,
  };
  return Ticket.create(newTicket)
    .then(async (data: ITicket) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}
function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await Ticket.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<ITicket[]> {
  return new Promise(async (resolve, reject) => {
    const tickets = await Ticket.find();
    return resolve(tickets);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<ITicket> {
  return new Promise(async (resolve, reject) => {
    const ticket = await Ticket.findById(id);
    return resolve(ticket);
  });
}

function Update(ticket: ITicket, updates: ITicketDTO): Promise<ITicket> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        lastUpdated: new Date().getTime(),
        priority: updates.priority,
        seenByAdmin: updates.seenByAdmin,
        seenByUser: updates.seenByUser,
        version: updates.version++,
      };

      const updatedCard = await Ticket.findByIdAndUpdate(
        ticket._id,
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
      const deleted = await Ticket.findByIdAndDelete(id);

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
