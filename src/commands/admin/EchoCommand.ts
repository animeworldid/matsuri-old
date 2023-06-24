/* eslint-disable no-eval */
import { Command, ApplicationCommandRegistry, RegisterBehavior, CommandOptionsRunTypeEnum, Result } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { APIEmbedField, ApplicationCommandOptionType, EmbedBuilder, TextChannel } from "discord.js";
import { guildsToRegister } from "../../config.js";
import { Channels } from "../../constants/index.js";
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
                },
                {
                    name: "reply_to",
                    type: ApplicationCommandOptionType.String,
                    description: "Message id you want to reply"
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
        const replyToId = interaction.options.getString("reply_to");
        const textChannel = await interaction.client.channels.fetch(channel) as TextChannel;
        const logChannel = await interaction.client.channels.fetch(Channels.EchoLog) as TextChannel;
        const fields: APIEmbedField[] = [];
        fields.push({ name: "#️⃣ Channel", value: `<#${textChannel.id}>`, inline: true });
        let isSent = false;
        if (replyToId) {
            const replyMessage = await textChannel.messages.fetch(replyToId);
            isSent = (await Result.fromAsync(replyMessage.reply(input))).isOk();
            fields.push({ name: "↩ Reply To", value: `<@${replyMessage.author.id}>`, inline: true });
            fields.push({ name: "✉ Content", value: replyMessage.content });
        } else {
            isSent = (await Result.fromAsync(textChannel.send(input))).isOk();
        }
        fields.push({ name: "📨 Message", value: input });
        if (!isSent) return interaction.reply({ content: "Failed to send message. No perms, probably?", ephemeral: true });
        const embed = new EmbedBuilder()
            .setAuthor({ name: "🔊 Echo", iconURL: this.container.client.user!.displayAvatarURL() })
            .addFields(fields)
            .setFooter({ text: `Requested by: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        await logChannel.send({ embeds: [embed] });
        return interaction.reply({ content: "Message sent!", ephemeral: true });
    }
}
