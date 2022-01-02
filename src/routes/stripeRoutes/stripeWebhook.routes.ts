import { TRoutesInput } from "../../types/routes";
import { logReq, logRes } from "../../middlewares/log.middleware";
import { apiRoutes } from "../routeRegistry";
import bodyParser from "body-parser";
import Stripe from "stripe";
import userController from "../../controllers/user.controller";
import { checkIfAuthenticated } from "../../middlewares/auth.middleware";
import appData from "../../config/appData";
import stripeService from "../../services/stripe/stripe.service";
import logger from "../../config/winston";

export default ({ app }: TRoutesInput) => {
  /**
   * POST Webook
   */
  app.post(
    apiRoutes.stripe + "/webhook",
    logReq,
    bodyParser.raw({ type: "application/json" }),
    async (req: any, res: any, next: any) => {

      try {
        await stripeService.webhooks.handleEvent(req);
        return res.json({ received: true });
      } catch(e) {
        logger.error(e);
        return res.status(500).send();
      }
      
    }
  );

};
