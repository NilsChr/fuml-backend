import Stripe from "stripe";
import { stripe } from "./stripe.service";

interface stripeProduct {
  product: Stripe.Product;
  price: Stripe.Price;
}

const stripeSubscriptions = {
  cancelSubscription(subscription_id: string): Promise<any> {
    return new Promise(async (resolve) => {
      await stripe.subscriptions.del(subscription_id);

      resolve("");
    });
  },
};

export default stripeSubscriptions;
