import { TRoutesInput } from "../types/routes";

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

export default ({ app }: TRoutesInput) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
