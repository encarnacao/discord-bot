import { logger } from "@utils";
import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { getHealthInfo } from "@repositories";

export async function handleHealthCommand(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  try {
    await interaction.deferReply();

    const healthInfo = await getHealthInfo();
    const jsonOutput = JSON.stringify(healthInfo, null, 2);
    logger.info(`Fetched health info for /companies command`);
    await interaction.editReply({
      content: `\`\`\`json\n${jsonOutput}\n\`\`\``,
    });
    logger.info(`Slash command /health executed by ${interaction.user.tag}`);
  } catch (error) {
    logger.error({ error }, "Error executing /health command");
    await interaction.editReply({
      content: "An error occurred while fetching health info.",
    });
  }
}
