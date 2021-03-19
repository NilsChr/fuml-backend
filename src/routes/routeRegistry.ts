import { TRoutesInput } from "../types/routes";
import projectRoutes from "./project.routes";
import userRoutes from "./user.routes";

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
    projectRoutes({app});
}