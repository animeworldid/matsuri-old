import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";
import moment from "moment";
import { ApplicationCommandOptionType, ChannelType, GuildVerificationLevel } from "discord.js";

@ApplyOptions<Command.Options>({
    name: "server",
    description: "Check the server information",
    requiredClientPermissions: ["EmbedLinks"]
})
export class ServerinfoCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "roles",
                    description: "Check server's roles",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "icon",
                    description: "View server's icon",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "info",
                    description: "Check detailed server's information",
                    type: ApplicationCommandOptionType.Subcommand
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
        const verificationLevels: Record<GuildVerificationLevel, string> = {
            [GuildVerificationLevel.High]: "High (Must also be a member of this server for longer than 10 minutes)",
            [GuildVerificationLevel.Low]: "Low (Must have a verified email on their Discord account)",
            [GuildVerificationLevel.Medium]: "Medium (Must also be registered on Discord for longer than 5 minutes)",
            [GuildVerificationLevel.None]: "None (Unrestricted)",
            [GuildVerificationLevel.VeryHigh]: "Highest (Must have a verified phone on their Discord account)"
        };

        const textChannels = interaction.guild!.channels.cache.filter(e => e.type !== ChannelType.GuildVoice).size;
        const voiceChannels = interaction.guild!.channels.cache.filter(e => e.type === ChannelType.GuildVoice).size;
        const categoryChannels = interaction.guild!.channels.cache.filter(e => e.type === ChannelType.GuildCategory).size;

        const offlineMembers = interaction.guild!.members.cache.filter(m => m.presence?.status === "offline").size.toLocaleString();
        const uniqueMembers = interaction.guild!.members.cache.filter(m => m.presence?.status !== "offline" && m.presence?.status !== "online").size.toLocaleString();
        const idleMembers = interaction.guild!.members.cache.filter(m => m.presence?.status === "idle").size;
        const dndMembers = interaction.guild!.members.cache.filter(m => m.presence?.status === "dnd").size;

        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "info") {
            const serverowner = await interaction.guild?.fetchOwner();

            const serverembed = Util.createEmbed("info")
                .setThumbnail(interaction.guild!.iconURL({ extension: "png", size: 4096 }))
                .setAuthor({ name: `${interaction.guild!.name} - Discord Server` })
                .setDescription("You can type **`server roles`** to list the server roles,\nand also **`server icon`** to show the server icon.")
                .addFields(
                    {
                        name: "**OVERVIEW**",
                        value: `\`\`\`asciidoc
• Name     :: ${interaction.guild!.name}
• ID       :: ${interaction.guild!.id}
• V. Level :: ${verificationLevels[interaction.guild!.verificationLevel]}\`\`\``
                    },
                    {
                        name: "**STATUS**",
                        value: `\`\`\`asciidoc
• Roles    :: ${interaction.guild!.roles.cache.size}
• Channels :: [${interaction.guild!.channels.cache.size}]
            :: ${categoryChannels} Category
            :: ${textChannels} Text
            :: ${voiceChannels} Voice
• Members  :: [${interaction.guild!.memberCount}]
            :: ${uniqueMembers} Online
            :: ${idleMembers} Idle
            :: ${dndMembers} Do Not Disturb
            :: ${offlineMembers} Invisible\`\`\``
                    },
                    {
                        name: "**ABOUT**",
                        value: `\`\`\`asciidoc
• Owner    :: ${serverowner!.user.tag}
            :: ${serverowner!.user.id}
• Created  :: ${moment.utc(interaction.guild!.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}\`\`\``
                    }
                )
                .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [serverembed] });
        }

        if (subcommand === "roles") {
            const serverrolesembed = Util.createEmbed("info")
                .setThumbnail(interaction.guild!.iconURL({ extension: "png", size: 2048 }))
                .setAuthor({ name: `${interaction.guild!.name} - Roles List` })
                .addFields({
                    name: `**Server roles** [**${interaction.guild!.roles.cache.size}**]`,
                    value: `${interaction.guild!.roles.cache.map(roles => roles).join("\n• ")}`,
                    inline: true
                })
                .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [serverrolesembed] });
        }

        if (subcommand === "icon") {
            const avaServer = Util.createEmbed("info")
                .setImage(`${interaction.guild!.iconURL({ extension: "png", size: 4096 })!}`)
                .setAuthor({ name: `${interaction.guild!.name} - Server Icon` })
                .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();
            return interaction.reply({ embeds: [avaServer] });
        }
    }
}
