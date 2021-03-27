import { TRoutesInput } from "../types/routes";
import projectRoutes from "./project.routes";
import projectCollaboratorRoutes from "./project.collaborators.routes";
import userRoutes from "./user.routes";
import entityDocumentsRoutes from "./entityDocuments.routes";
import sequenceDocumentsRoutes from "./sequenceDocuments.routes";

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
    projectRoutes({app});
    projectCollaboratorRoutes({app});
    entityDocumentsRoutes({app});
    sequenceDocumentsRoutes({app});
}