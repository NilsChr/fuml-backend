const morgan = require("morgan");
import logger from '../config/winston';

logger.stream = {
  write: (message: any) =>
    logger.info(message.substring(0, message.lastIndexOf("\n"))),
};

module.exports = morgan(
  ":remote-addr :method :url :status :response-time ms - :res[content-length]",
  { stream: logger.stream }
);
