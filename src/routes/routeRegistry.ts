import { TRoutesInput } from "../types/routes";
import projectRoutes from "./project.routes";
import projectCollaboratorRoutes from "./project.collaborators.routes";
import userRoutes from "./user.routes";

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
    projectRoutes({app});
    projectCollaboratorRoutes({app});
}