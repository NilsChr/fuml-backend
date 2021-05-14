import mongoose, { Schema, Document } from "mongoose";

const CustomerInvoiceSchema: Schema = new Schema({
  stripeInvoiceId: { type: String },
  period_start: { type: Number },
  period_end: { type: Number },
  currency: { type: String },
  subtotal: { type: String },
  invoice_pdf: { type: String },
  payment_intent: { type: String },
  refunded: { type: Boolean },
  active: { type: Boolean },
  cancelled: { type: Boolean },
  stripeSubscriptionId: { type: String },
  stripeProductId: { type: String },
  stripeProductName: { type: String },
});

export class CustomerInvoice {
  stripeInvoiceId: String;
  period_start: number;
  period_end: number;
  currency: String;
  subtotal: number;
  invoice_pdf: String;
  payment_intent: String;
  refunded: boolean;
  active: boolean;
  cancelled: boolean;
  stripeSubscriptionId: String;
  stripeProductId: String;
  stripeProductName: String;
}

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  created: Number;
  invoices: CustomerInvoice[];
}

export interface ICustomerDTO {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId: string;
  created: Number;
  invoices: CustomerInvoice[];
}

const CustomerSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  stripeCustomerId: { type: String },
  created: { type: Number },
  invoices: [CustomerInvoiceSchema],
});

// Export the model and return your IUser interface
export default mongoose.model<ICustomer>("Customer", CustomerSchema);
