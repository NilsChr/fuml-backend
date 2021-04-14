const { createLogger, transports, format } = require('winston');
import ILogger from '../types/logger';


let transportsObjects = [
  new transports.File({
    filename: './logs/all-logs.log',
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
  }),
  new transports.Console(),
]

if(process.env.NODE_ENV === 'test') {
  transportsObjects = [];
}



const logger: ILogger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.printf((info:any) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: transportsObjects
  /*
  transports: [
    new transports.File({
      filename: './logs/all-logs.log',
      json: false,
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ]
  */
});


export default logger;