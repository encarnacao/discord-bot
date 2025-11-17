import { logger } from "@utils";
import { CacheType, ChatInputCommandInteraction } from "discord.js";

export async function handleUserInfoCommand(
  interaction: ChatInputCommandInteraction<CacheType>
) {
  try {
    await interaction.deferReply();
    const jsonOutput = JSON.stringify(interaction.user, null, 2);
    await interaction.editReply({
      content: `\`\`\`json\n${jsonOutput}\n\`\`\``,
    });
    logger.info(`Slash command /user-info executed by ${interaction.user.tag}`);
  } catch (error) {
    logger.error({ error }, "Error executing /user-info command");
    await interaction.editReply({
      content: "An error occurred while fetching user-info info.",
    });
  }
}
