import { config } from "../config/env.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const weights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function write(level: LogLevel, message: string, context?: unknown): void {
  if (weights[level] < weights[config.LOG_LEVEL]) return;

  const line = `[${new Date().toISOString()}] [Light Code] [${level.toUpperCase()}] ${message}`;
  switch (level) {
    case "debug":
      context === undefined ? console.debug(line) : console.debug(line, context);
      break;
    case "info":
      context === undefined ? console.info(line) : console.info(line, context);
      break;
    case "warn":
      context === undefined ? console.warn(line) : console.warn(line, context);
      break;
    case "error":
      context === undefined ? console.error(line) : console.error(line, context);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: unknown) => write("debug", message, context),
  info: (message: string, context?: unknown) => write("info", message, context),
  warn: (message: string, context?: unknown) => write("warn", message, context),
  error: (message: string, context?: unknown) => write("error", message, context)
};
