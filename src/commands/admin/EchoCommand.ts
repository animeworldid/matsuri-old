/* eslint-disable no-eval */
import { Command, ApplicationCommandRegistry, RegisterBehavior, CommandOptionsRunTypeEnum, Result } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandOptionType, TextChannel } from "discord.js";
import { guildsToRegister } from "../../config";

@ApplyOptions<Command.Options>({
    aliases: ["say"],
    name: "echo",
    quotes: [],
    description: "Makes bot say what you tell them",
    detailedDescription: {
        usage: "{prefix}echo <text>"
    },
    preconditions: ["adminOnly"],
    runIn: [CommandOptionsRunTypeEnum.GuildText],
    requiredClientPermissions: ["SendMessages"]
})
export class ExecCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "input",
                    type: ApplicationCommandOptionType.String,
                    description: "Make bot say what you tell them",
                    required: true
                },
                {
                    name: "channel",
                    type: ApplicationCommandOptionType.Channel,
                    description: "Channel you want to send the message to"
                }
            ]
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<any> {
        const input = interaction.options.getString("input", true);
        const channel = interaction.options.getChannel("channel")?.id ?? interaction.channelId;
        const textChannel = await interaction.client.channels.fetch(channel) as TextChannel;
        const isSent = (await Result.fromAsync(textChannel.send(input))).isOk();
        if (!isSent) return interaction.reply({ content: "Failed to send message. No perms, probably?", ephemeral: true });
        return interaction.reply({ content: "Message sent!", ephemeral: true });
    }
}
