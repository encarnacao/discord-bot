import { logger } from "@utils";
import { DiscordBot } from "@discord";
import { closePool } from "@database";
import { config } from "dotenv";

config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.development",
});

async function gracefulShutdown(
  discordBot: DiscordBot | null,
  signal: string
): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    if (discordBot) {
      await discordBot.sendMessageEmbed(
        `Shutting Down`,
        `The Discord Bot is shutting down due to ${signal}.`,
        0xff0000,
        { Status: "Shutting Down" }
      );
      await discordBot.disconnect();
    }

    logger.info("Closing database connection pool...");
    await closePool();
    logger.info("Database pool closed successfully.");

    logger.info("Graceful shutdown completed.");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Error during graceful shutdown");
    process.exit(1);
  }
}

export default async function main() {
  let discordBot: DiscordBot | null = null;

  try {
    logger.info("Starting Discord Bot...");
    discordBot = new DiscordBot(process.env.CHANNEL_ID as string);

    process.on("SIGINT", () => gracefulShutdown(discordBot, "SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown(discordBot, "SIGTERM"));

    while (!discordBot.isRunning()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    logger.info("Discord Bot started successfully.");
    await discordBot.sendMessageEmbed(
      `Testing Discord Bot`,
      `The Discord Bot is now operational!`,
      0x0b6623,
      { Status: "Operational" }
    );
  } catch (err: any) {
    logger.error("Error in main function:", err);
    if (discordBot) {
      await gracefulShutdown(discordBot, "ERROR");
    }
    return false;
  }
}

main();
