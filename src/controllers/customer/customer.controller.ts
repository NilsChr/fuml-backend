import mongoose from "mongoose";
import Customer, {
  ICustomer,
  ICustomerDTO,
} from "../../models/customer/customer.model";

function Create(customer: ICustomerDTO): Promise<ICustomer> {
  return Customer.create(customer)
    .then(async (data: ICustomer) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

function Flush(): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const result = await Customer.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<ICustomer[]> {
  return new Promise(async (resolve, reject) => {
    const customers = await Customer.find();
    return resolve(customers);
  });
}

function GetById(id: mongoose.Types.ObjectId): Promise<ICustomer> {
  return new Promise(async (resolve, reject) => {
    const customer = await Customer.findById(id);
    return resolve(customer);
  });
}

function GetByUserId(userId: mongoose.Types.ObjectId): Promise<ICustomer> {
  return new Promise(async (resolve, reject) => {
    const query = { userId: userId };
    const customer = await Customer.findOne(query);
    return resolve(customer);
  });
}

function GetByStripeId(
  stripeCustomerId: string
): Promise<ICustomer> {
  return new Promise(async (resolve, reject) => {
    const query = { stripeCustomerId: stripeCustomerId };
    const customer = await Customer.findOne(query);
    return resolve(customer);
  });
}

function Update(
  customer: ICustomer,
  updates: ICustomerDTO
): Promise<ICustomer> {
  return new Promise(async (resolve, reject) => {
    try {
      const sanitizedUpdates = {
        invoices: updates.invoices,
      };

      const updatedProject = await Customer.findByIdAndUpdate(
        customer._id,
        sanitizedUpdates,
        { new: true }
      );

      resolve(updatedProject);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await Customer.findByIdAndDelete(id);
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
  GetByUserId,
  GetByStripeId,
  Update,
  Delete,
};
