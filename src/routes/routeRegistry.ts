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
import textDocumentsRoutes from "./textDocuments.routes";
import stripeWebhookRoutes from "./stripeRoutes/stripeWebhook.routes";
import stripeIntegrationRoutes from "./stripeRoutes/stripeIntegration.routes";
import adminRoutes from "./adminRoutes/admin.routes";

export const apiRoutes = {
    projects: '/api/projects',
    entityDocuments: '/api/entitydocuments',
    sequenceDocuments: '/api/sequencedocuments',
    textDocuments: '/api/textdocuments',
    services: '/api/services',
    users: '/api/users',
    kanbanboards: '/api/kanbanboards',
    stripe: '/api/stripe',
    admin: {
        tickets: '/api/admin/tickets'
    } 
}

export default ({ app }: TRoutesInput) => {
    userRoutes({app});
    projectRoutes({app});
    projectCollaboratorRoutes({app});

    // Services
    servicesRoutes({app});

    // Documents
    entityDocumentsRoutes({app});
    sequenceDocumentsRoutes({app});
    textDocumentsRoutes({app});


    // Kanban
    kanbanBoardRoutes({app});
    kanbanBoardCardRoutes({app});
    kanbanBoardCommentRoutes({app});

    // Strike
    stripeWebhookRoutes({app});
    stripeIntegrationRoutes({app});

    // Admin
    adminRoutes({app});
}