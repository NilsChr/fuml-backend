import Stripe from "stripe";
import { stripe } from "./stripe.service";

interface stripeProduct {
    product: Stripe.Product,
    price: Stripe.Price
}

const stripeProducts = {
  getProducts(): Promise<stripeProduct[]> {
    return new Promise(async (resolve) => {
      const products = await stripe.products.list();
      const prices = await stripe.prices.list();

      const joined = products.data.map((product) => {
        const price = prices.data.find((price) => price.product == product.id);
        return {
          product,
          price,
        };
      });

      resolve(joined);
    });
  },
};

export default stripeProducts;
