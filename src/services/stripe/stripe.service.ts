import Stripe from "stripe";
import stripeProducts from "./stripeProducts.service";
import stripeCoupons from "./stripeCoupons.service";
import stripeCheckout from "./stripeCheckout.service";
import stripeWebhook from "./stripeWebhook.service";

const API_KEY = process.env.STRIPE_KEY;

export const stripe = new Stripe(API_KEY, {
  apiVersion: "2020-08-27",
});


const stripeService = {
    checkout: stripeCheckout,
    products: stripeProducts,
    coupons: stripeCoupons,
    webhooks: stripeWebhook
}

export default stripeService;