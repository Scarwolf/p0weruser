const enableDebugLogging = import.meta.env.DEV;

const info = console.info;
const debug = (message?: any, ...optionalParams: any[]) => enableDebugLogging ? console.debug(message, ...optionalParams) : {};

export {
  info,
  debug
}
