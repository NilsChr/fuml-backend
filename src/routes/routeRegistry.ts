import { TRoutesInput } from "../types/routes";
import projectRoutes from "./project.routes";
import projectCollaboratorRoutes from "./project.collaborators.routes";
import userRoutes from "./user.routes";
import entityDocumentsRoutes from "./entityDocuments.routes";
import sequenceDocumentsRoutes from "./sequenceDocuments.routes";
import servicesRoutes from "./services.routes";
import kanbanBoardRoutes from "./kanbanRoutes/kanbanBoard.routes";
import kanbanBoardCardRoutes from "./kanbanRoutes/kanbanBoardCard.routes";
import kanbanBoardCommentRoutes from "./kanbanRoutes/kanbanBoardComment.routes";

export const apiRoutes = {
    projects: '/api/projects',
    entityDocuments: '/api/entitydocuments',
    sequenceDocuments: '/api/sequencedocuments',
    services: '/api/services',
    users: '/api/users',

    kanbanboards: '/api/kanbanboards'
}

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
    projectRoutes({app});
    projectCollaboratorRoutes({app});
    entityDocumentsRoutes({app});
    sequenceDocumentsRoutes({app});
    servicesRoutes({app});

    // Kanban
    kanbanBoardRoutes({app});
    kanbanBoardCardRoutes({app});
    kanbanBoardCommentRoutes({app});
}