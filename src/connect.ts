import mongoose from "mongoose";
import logger from "./config/winston";

type TInput = {
  db: string;
};
export default ({ db }: TInput) => {
  const connect = () => {
    mongoose
      .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      })
      .then(() => {
        return logger.info(`Successfully connected to ${db}`); //console.info(`Successfully connected to ${db}`);
      })
      .catch((error) => {
        //console.error("Error connecting to database: ", error);
        logger.error("Error connecting to database: ", error);
        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on("disconnected", connect);
};
