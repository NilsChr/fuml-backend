import { TRoutesInput } from "../../types/routes";
import { logReq, logRes } from "../../middlewares/log.middleware";
import { apiRoutes } from "../routeRegistry";
import bodyParser from "body-parser";
import Stripe from "stripe";
import userController from "../../controllers/user.controller";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import appData from "../../config/appData";
import stripeService from "../../services/stripe/stripe.service";
import { IUser, IUserDTO } from "../../models/user.model";
import {
  CHECKOUT_ERROR,
  stripeCheckout,
} from "../../services/stripe/stripeCheckout.service";

export default ({ app }: TRoutesInput) => {
  app.get(
    apiRoutes.stripe + "/products",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      const data = await stripeService.products.getProducts();
      res.status(200).send(data);
    }
  );

  app.post(
    apiRoutes.stripe + "/checkout",
    logReq,
    checkIfAuthenticated,
    async (req: any, res: any, next: any) => {
      try {
        const user: IUser = req.user;

        const body = req.body;
        console.log("body", body);

        const checkoutData: stripeCheckout = {
          coupon: body.coupon,
          stripePrice: body.stripePrice,
        };

        const session = await stripeService.checkout.createCheckout(
          user,
          checkoutData
        );

        res.status(200).send({message:'success', session: session});
      } catch (e) {
        if (e == CHECKOUT_ERROR.ACTIVE_PLAN_EXISTS) {
          res.status(200).send({message:CHECKOUT_ERROR.ACTIVE_PLAN_EXISTS, session: null});
        } else {
          console.log(e);

          res.status(500).send({message:'error', session: null});
        }
      }
    }
  );
};
