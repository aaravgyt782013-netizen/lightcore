import { ContainerBuilder, TextDisplayBuilder } from "discord.js";

export const LIGHT_CODE_RED = 0xe53935;
export const LIGHT_CODE_GOLD = 0xf4b942;

export function createLightCodeContainer(
  title: string,
  lines: readonly string[],
  accentColor = LIGHT_CODE_RED
): ContainerBuilder {
  return new ContainerBuilder()
    .setAccentColor(accentColor)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent([title, ...lines].join("\n"))
    );
}
