import express from "express";
import Stripe from "stripe";
import logger from "../../config/winston";
import customerController from "../../controllers/customer/customer.controller";
import { CustomerInvoice } from "../../models/customer/customer.model";
import { stripe } from "./stripe.service";

const stripeEvents = {
  checkout: {
    sessions: {
      completed: "checkout.session.completed",
    },
  },
  charge: {
    succeeded: "charge.succeeded",
  },
  subscription_schedule: {
    canceled: "subscription_schedule.canceled"
  }
};

const endpointSecret = "whsec_qgXTFm4Ike1xXYgxfNpx2ARdUXmPGYhf";

const stripeWebhook = {
  handleEvent(req: express.Request): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const sig = req.headers["stripe-signature"];

        let event;
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
          console.log(err);
          return reject(`Webhook Error: ${err.message}`);
        }

        let res;
        switch (event.type) {
          case stripeEvents.charge.succeeded:
            res = await stripeWebhook.handleChargeSucceeded(event);
            return resolve(res);
          case stripeEvents.checkout.sessions.completed:
            res = await stripeWebhook.handleCheckoutSessionCompleted(event);
            return resolve(res);
            case stripeEvents.subscription_schedule.canceled:
            res = await stripeWebhook.handleSubscriptionScheduleCanceled(event);
            return resolve(res);
        }

        logger.warn("Stripe Webhook not handled. Type: " + event.type);
        console.log(event);

        resolve({});
      } catch (e) {
        reject(e);
      }
    });
  },

  handleChargeSucceeded(event: Stripe.Event): Promise<any> {
    return new Promise(async (resolve, reject) => {
      console.log("TYPE: ", stripeEvents.charge.succeeded);
      const eventId = event.id;
      console.log("Event id", eventId);
      const d = await stripe.events.retrieve(eventId);
      resolve({});
    });
  },

  handleCheckoutSessionCompleted(event: Stripe.Event): Promise<any> {
    return new Promise(async (resolve, reject) => {
      console.log("TYPE: ", stripeEvents.checkout.sessions.completed);
      const customer = await customerController.GetByStripeId((<any>event.data.object).customer);

      console.log("Event", event);

      const subscriptionId = (<any>event.data.object).subscription;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log("subscription", subscription);

      const stripeInvoice = await stripe.invoices.retrieve(
        <string>subscription.latest_invoice
      );
      console.log("stripeInvoice", stripeInvoice);


      const product = await stripe.products.retrieve(
        (<any>subscription).plan.product
      );
      console.log("product", product);

      const invoice:CustomerInvoice = {
        stripeInvoiceId: stripeInvoice.id,
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end,
        currency: stripeInvoice.currency,
        subtotal: stripeInvoice.subtotal,
        invoice_pdf: stripeInvoice.invoice_pdf,
        payment_intent: <any>stripeInvoice.payment_intent,
        refunded: false,
        active: true,
        cancelled: false,
        stripeSubscriptionId: subscription.id,
        stripeProductId: product.id,
        stripeProductName: product.name
      };

      console.log('Invoice', invoice);
      customer.invoices.push(invoice);
      await customerController.Update(customer, customer);

      resolve({});
    });
  },

  handleSubscriptionScheduleCanceled(event: Stripe.Event): Promise<any> {
    return new Promise(async (resolve, reject) => {
      console.log("TYPE: ", stripeEvents.subscription_schedule.canceled);
      const eventId = event.id;
      console.log("Event id", eventId);

      const customer = await customerController.GetByStripeId((<any>event.data.object).customer);

      console.log(customer);
      for(let i = 0; i < customer.invoices.length; i++) {
        if(customer.invoices[i].stripeSubscriptionId == event.id) {
          customer.invoices[i].active = false;
          customer.invoices[i].cancelled = true;
        }
      }
      await customerController.Update(customer, customer);

      resolve({});
    });
  },
};

export default stripeWebhook;
