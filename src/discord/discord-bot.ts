import {
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { createPropsFields, logger } from "@utils";
import { handleHealthCommand, handleUserInfoCommand } from "./slash-commands";
import { basicHandler } from "./button-handlers";

class DiscordBot {
  private running: boolean = false;
  private client = new Client({ intents: [GatewayIntentBits.Guilds] });
  public channelId: string;

  constructor(channelId: string) {
    this.channelId = channelId;
    this.start().then(() => {
      logger.info("Discord Bot started in constructor.");
    });
  }

  private async start() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      logger.error("Discord token is not defined in environment variables.");
      return;
    }
    this.client.once(Events.ClientReady, async () => {
      logger.info(`Discord Bot logged in as ${this.client.user?.tag}`);
      await this.registerSlashCommands();
      this.running = true;
    });
    await this.buttonInteractionListener();
    this.slashCommandListener();
    await this.client.login(token);
  }

  public isRunning(): boolean {
    return this.running;
  }

  public async disconnect(): Promise<void> {
    if (!this.running) {
      logger.warn("Discord Bot is not running. Nothing to disconnect.");
      return;
    }

    try {
      logger.info("Disconnecting Discord Bot...");
      this.client.destroy();
      this.running = false;
      logger.info("Discord Bot disconnected successfully.");
    } catch (error) {
      logger.error({ error }, "Error disconnecting Discord Bot");
      throw error;
    }
  }

  public async sendMessageEmbed(
    title: string,
    message: string,
    embedColor: number = 0x0099ff,
    props: { [key: string]: any } = {},
    buttonsEnabled: boolean = false
  ) {
    if (!this.running) {
      logger.error("Discord Bot is not running. Cannot send message.");
      return;
    }
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel || !channel.isTextBased()) {
      logger.error(
        `Channel with ID ${this.channelId} not found or is not text-based.`
      );
      return;
    }
    const greenButton = new ButtonBuilder()
      .setLabel("Accept")
      .setCustomId(`accept_button`)
      .setStyle(ButtonStyle.Success);
    const redButton = new ButtonBuilder()
      .setLabel("Ignore")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("ignore_button");
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      greenButton,
      redButton
    );
    const fields = createPropsFields(props);
    const embedMessage = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(message)
      .addFields(fields)
      .setTimestamp();
    await (channel as TextChannel).send({
      embeds: [embedMessage],
      components: buttonsEnabled ? [row] : undefined,
    });
    logger.info(`Message sent to channel ID ${this.channelId}.`);
  }

  private async buttonInteractionListener() {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;
      await basicHandler(interaction);
    });
  }

  private async registerSlashCommands() {
    const token = process.env.DISCORD_TOKEN;
    if (!token || !this.client.user) {
      logger.error("Cannot register slash commands: missing token or user.");
      return;
    }

    const commands = [
      new SlashCommandBuilder()
        .setName("status")
        .setDescription("Retrieves current health status of database.")
        .toJSON(),
      new SlashCommandBuilder()
        .setName("user-info")
        .setDescription("Fetches information about the user.")
        .toJSON(),
    ];

    const rest = new REST({ version: "10" }).setToken(token);

    try {
      logger.info("Started refreshing application (/) commands.");
      await rest.put(Routes.applicationCommands(this.client.user.id), {
        body: commands,
      });
      logger.info("Successfully reloaded application (/) commands.");
    } catch (error) {
      logger.error({ error }, "Error registering slash commands");
    }
  }

  private slashCommandListener() {
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === "status") {
        await handleHealthCommand(interaction);
      }
      if (interaction.commandName === "user-info") {
        await handleUserInfoCommand(interaction);
      }
    });
  }
}

export { DiscordBot };
