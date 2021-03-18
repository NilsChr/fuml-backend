import { TRoutesInput } from "../types/routes";
import userRoutes from "./user.routes";

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
}