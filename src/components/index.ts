import type { ButtonHandler } from "./types.js";
import { aboutButton } from "./buttons/about.js";

export const buttonHandlers: ButtonHandler[] = [aboutButton];

export const buttonHandlerMap = new Map(
  buttonHandlers.map((handler) => [handler.customId, handler])
);
