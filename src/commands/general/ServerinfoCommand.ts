import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { guildsToRegister, isDev } from "../../config";
import { Util } from "../../utils/Util";
import moment from "moment";
import { CommandContext, ContextCommand } from "@frutbits/command-context";

@ApplyOptions<Command.Options>({
    aliases: ["infoserver", "server", "servers", "sinfo"],
    name: "serverinfo",
    description: "Check the server information",
    detailedDescription: {
        usage: "{prefix}serverinfo [roles | icon]"
    },
    chatInputCommand: {
        register: true
    },
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class ServerinfoCommand extends ContextCommand {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async contextRun(ctx: CommandContext): Promise<any> {
        type verificationLevelsType = "HIGH" | "LOW" | "MEDIUM" | "NONE" | "VERY_HIGH";
        const verificationLevels: Record<verificationLevelsType, string> = {
            HIGH: "High (Must also be a member of this server for longer than 10 minutes)",
            LOW: "Low (Must have a verified email on their Discord account)",
            MEDIUM: "Medium (Must also be registered on Discord for longer than 5 minutes)",
            NONE: "None (Unrestricted)",
            VERY_HIGH: "Highest (Must have a verified phone on their Discord account)"
        };

        const textChannels = ctx.guild!.channels.cache.filter(e => e.type !== "GUILD_VOICE").size;
        const voiceChannels = ctx.guild!.channels.cache.filter(e => e.type === "GUILD_VOICE").size;
        const categoryChannels = ctx.guild!.channels.cache.filter(e => e.type === "GUILD_CATEGORY").size;

        const offlineMembers = ctx.guild!.members.cache.filter(m => m.presence?.status === "offline").size.toLocaleString();
        const uniqueMembers = ctx.guild!.members.cache.filter(m => m.presence?.status !== "offline" && m.presence?.status !== "online").size.toLocaleString();
        const idleMembers = ctx.guild!.members.cache.filter(m => m.presence?.status === "idle").size;
        const dndMembers = ctx.guild!.members.cache.filter(m => m.presence?.status === "dnd").size;

        const subcommand = ctx.isMessageContext() ? await ctx.args?.pickResult("string") : undefined;
        if (!subcommand?.success) {
            const serverowner = await ctx.guild?.fetchOwner();

            const serverembed = Util.createEmbed("info")
                .setThumbnail(ctx.guild!.iconURL({ dynamic: true, format: "png", size: 2048 })!)
                .setAuthor({ name: `${ctx.guild!.name} - Discord Server` })
                .setDescription("You can type **`server roles`** to list the server roles,\nand also **`server icon`** to show the server icon.")
                .addField("**OVERVIEW**", `\`\`\`asciidoc
• Name     :: ${ctx.guild!.name}
• ID       :: ${ctx.guild!.id}
• V. Level :: ${verificationLevels[ctx.guild!.verificationLevel]}\`\`\``)
                .addField("**STATUS**", `\`\`\`asciidoc
• Roles    :: ${ctx.guild!.roles.cache.size}
• Channels :: [${ctx.guild!.channels.cache.size}]
           :: ${categoryChannels} Category
           :: ${textChannels} Text
           :: ${voiceChannels} Voice
• Members  :: [${ctx.guild!.memberCount}]
           :: ${uniqueMembers} Online
           :: ${idleMembers} Idle
           :: ${dndMembers} Do Not Disturb
           :: ${offlineMembers} Invisible\`\`\``)
                .addField("**ABOUT**", `\`\`\`asciidoc
• Owner    :: ${serverowner!.user.tag}
           :: ${serverowner!.user.id}
• Created  :: ${moment.utc(ctx.guild!.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}\`\`\``)
                .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
                .setTimestamp();
            return ctx.send({ embeds: [serverembed] });
        }

        if (subcommand.value === "roles") {
            const serverrolesembed = Util.createEmbed("info")
                .setThumbnail(ctx.guild!.iconURL({ dynamic: true, format: "png", size: 2048 })!)
                .setAuthor({ name: `${ctx.guild!.name} - Roles List` })
                .addField(`**Server roles** [**${ctx.guild!.roles.cache.size}**]`, `${ctx.guild!.roles.cache.map(roles => roles).join("\n• ")}`, true)
                .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
                .setTimestamp();
            return ctx.send({ embeds: [serverrolesembed] });
        }

        if (subcommand.value === "icon" || subcommand.value === "avatar") {
            const avaServer = Util.createEmbed("info")
                .setImage(`${ctx.guild!.iconURL({ dynamic: true, format: "png", size: 4096 })!}`)
                .setAuthor({ name: `${ctx.guild!.name} - Server Icon` })
                .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
                .setTimestamp();
            return ctx.send({ embeds: [avaServer] });
        }
    }
}
