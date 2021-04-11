import { TRoutesInput } from "../../types/routes";
import { logReq, logRes } from "../../middlewares/log.middleware";
import { apiRoutes } from "../routeRegistry";
import bodyParser from "body-parser";
import Stripe from "stripe";
import userController from "../../controllers/user.controller";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import appData from "../../config/appData";

const API_KEY = process.env.STRIPE_KEY;
//const stripe = require('stripe')(API_KEY);

const stripe = new Stripe(API_KEY, {
  apiVersion: "2020-08-27",
});

const endpointSecret = "whsec_qgXTFm4Ike1xXYgxfNpx2ARdUXmPGYhf";

export default ({ app }: TRoutesInput) => {
  /**
   * POST Webook
   */
  app.post(
    apiRoutes.stripe + "/webhook",
    logReq,
    bodyParser.raw({ type: "application/json" }),
    async (req: any, res: any, next: any) => {
      const sig = req.headers["stripe-signature"];

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.log(err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      //console.log(event);

      // Handle the checkout.session.completed event
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Fulfill the purchase...
        //handleCheckoutSession(session);
      }

      if (event.type === "charge.succeeded") {
        console.log("TYPE: ", "charge.succeeded");
        const eventId = event.id;
        console.log("Event id", eventId);
        const d = await stripe.events.retrieve(eventId);
        //console.log("Event data", d);
        //console.log("Event data", d.data.object);

        // Fulfill the purchase...
        //handleCheckoutSession(session);
      }

      if (event.type === "checkout.session.completed") {
        console.log("TYPE: ", "checkout.session.completed");

        const session: any = event.data.object;

        const product = await stripe.subscriptions.retrieve(
          session.subscription
        );

        // Fulfill the purchase...
        //console.log('session', session);
        //console.log('product', product);

        const customerEmail = session.customer_details.email;

        const user = await userController.GetByEmail(customerEmail);
        if (!user) {
          console.log("REFUND NEEDED");
          //stripe.products.retrieve(productId._id).
        }

        const productId = product.id;
        const period_start = product.current_period_start;
        const period_end = product.current_period_end;

        console.log(customerEmail, productId, period_start, period_end);
      }

      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    }
  );

  app.get(
    apiRoutes.stripe + "/products",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
        //console.log('CHECK')
        const products = await stripe.products.list();
        const prices = await stripe.prices.list();
        //console.log('GOT PRODUCTS', products);
        //console.log('GOT PRICES', prices);
        /*const joined = [...(<any>products)].map(p => {
          const price = [...(<any>prices)].filter(pr => )
        })*/
        const joined = products.data.map(product => {
          const price = prices.data.find(price => price.product == product.id);
          return {
            product,
            price
          }
        })
        console.log(joined);
        res.status(200).send(joined);
    }
  );

  app.post(apiRoutes.stripe + "/coupons",
  logReq,
  checkIfAuthenticated,
  async (req: any, res: any, next: any) => {
    const search = req.body.coupon;

    const coupons = stripe.coupons.list();

    console.log(coupons);

    res.status(200).send(coupons);

  })


  app.post(
    apiRoutes.stripe + "/checkout",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const user = req.user;

      const body = req.body;
      console.log('body',body);

      const coupons = await stripe.coupons.list();
      console.log(coupons);

      const couponObj = coupons.data.find(c => c.name == body.coupon);
      console.log(couponObj)
      const discounts:any = [];
      if(couponObj) {
        discounts.push({coupon:couponObj.id})
      }

      const session = await stripe.checkout.sessions.create({
        success_url: appData.frontEndUrl + 'subscribe-success',//"https://example.com/success",
        cancel_url: appData.frontEndUrl + 'subscribe-cancel',
        payment_method_types: ["card"],
        line_items: [{ price: "price_1If51cL9YgD3C6pQDUrokgkn", quantity: 1 }],
        mode: "subscription",
        discounts: discounts,
        /*discounts: [
          {
            coupon: "nbRjXJBf",
          },
        ],*/
      });

      res.status(200).send(session);
    }
  );
};
