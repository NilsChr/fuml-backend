import Stripe from "stripe";
import appData from "../../config/appData";
import customerController from "../../controllers/customer/customer.controller";
import { ICustomerDTO } from "../../models/customer/customer.model";
import User, { IUser, IUserDTO } from "../../models/user.model";
import { stripe } from "./stripe.service";

export const CHECKOUT_ERROR = {
    ACTIVE_PLAN_EXISTS: 'Active plan already exists'
}

export interface stripeCheckout {
  coupon: string;
  stripePrice: string;
}

const stripeProducts = {
  createCheckout(
    user: IUser,
    data: stripeCheckout
  ): Promise<Stripe.Checkout.Session> {
    return new Promise(async (resolve, reject) => {
      let customer = await customerController.GetByUserId(user._id);
      if (!customer) {
          const stripeCustomer = await stripe.customers.create({
              email: user.email,
          })
          const newCustomer: ICustomerDTO = {
            created: stripeCustomer.created,
            invoices: [],
            stripeCustomerId: stripeCustomer.id,
            userId: user._id
          }
          customer = await customerController.Create(newCustomer);
      }

      const now = new Date().getTime() / 1000;
      const activePlan = customer.invoices.filter(i => i.period_start <= now && i.period_end >= now && i.active && !i.refunded);
      if(activePlan.length > 0) {
        return reject(CHECKOUT_ERROR.ACTIVE_PLAN_EXISTS);
      }

      console.log('CREATE SESSION');
      console.log('data', data);

      console.log('customer', customer);

      const coupons = await stripe.coupons.list();
      const couponObj = coupons.data.find((c) => c.name == data.coupon);

      const discounts: any = [];
      if (couponObj) {
        discounts.push({ coupon: couponObj.id });
      }
      console.log('discounts', discounts);

      const session = await stripe.checkout.sessions.create({
        success_url: appData.frontEndUrl + "subscribe-success",
        cancel_url: appData.frontEndUrl + "subscribe-cancel",
        payment_method_types: ["card"],
        line_items: [{ price: data.stripePrice, quantity: 1 }],
        mode: "subscription",
        discounts: discounts,
        customer: customer.stripeCustomerId,
      });

      resolve(session);
    });
  },
};

export default stripeProducts;
