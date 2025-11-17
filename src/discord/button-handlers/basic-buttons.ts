import { logger } from "@utils";
import {
  CacheType,
  ButtonInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { getHealthInfo } from "@repositories";

export async function basicHandler(interaction: ButtonInteraction<CacheType>) {
  // These were made just for testing buttons for the first time.
  const confirmAction = async () => {
    const healthInfo = await getHealthInfo();
    const jsonOutput = JSON.stringify(healthInfo, null, 2);
    await interaction.editReply({
      content: `\`\`\`json\n${jsonOutput}\n\`\`\``,
    });
    logger.info(`Confirm button clicked for ${interaction.customId}`);
  };
  const ignoreAction = () => {
    logger.info(`Ignore button clicked for ${interaction.customId}`);
  };
  const oldEmbeds = interaction.message.embeds;
  if (interaction.customId === "accept_button") {
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });
    await confirmAction();
    const newEmbeds = new EmbedBuilder(oldEmbeds[0].data).setColor(0x008a09);
    await interaction.message.edit({ embeds: [newEmbeds], components: [] });
  } else if (interaction.customId === "ignore_button") {
    ignoreAction();
    await interaction.reply({
      content: "You clicked the Ignore button!",
      flags: MessageFlags.Ephemeral,
    });
    const newEmbeds = new EmbedBuilder(oldEmbeds[0].data).setColor(0xff0000);
    await interaction.message.edit({ embeds: [newEmbeds], components: [] });
  }
}
