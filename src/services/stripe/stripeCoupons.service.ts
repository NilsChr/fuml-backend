import Stripe from "stripe";
import { stripe } from "./stripe.service";

const stripeProducts = {
  getProducts(): Promise<Stripe.ApiListPromise<Stripe.Coupon>> {
    return new Promise(async (resolve) => {
      const coupons = stripe.coupons.list();

      console.log(coupons);

      resolve(coupons);
    });
  },
};

export default stripeProducts;
