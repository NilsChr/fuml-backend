export default interface ILogger {
  error(...args: any): void;
  warn(...args: any): void;
  info(...args: any): void;
  http(...args: any): void;
  verbose(...args: any): void;
  debug(...args: any): void;
  silly(...args: any): void;
  stream: any;
}
