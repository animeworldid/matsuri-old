import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";

@ApplyOptions<Command.Options>({
    aliases: ["infouser", "user", "users", "uinfo"],
    name: "userinfo",
    description: "Check the user information",
    detailedDescription: {
        usage: "{prefix}userinfo [@mention | id]"
    },
    chatInputCommand: {
        register: true
    },
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class UserinfoCommand extends ContextCommand {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionTypes.USER,
                    description: "User to view",
                    required: true
                }
            ]
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async contextRun(ctx: CommandContext): Promise<any> {
        const msgArgs = ctx.isMessageContext() ? await ctx.args?.restResult("user") : undefined;
        const user = msgArgs?.value ?? (ctx.isCommandInteractionContext() ? ctx.options.getUser("user", true) : undefined) ?? ctx.author;

        const status = {
            dnd: "(Do Not Disturb)",
            idle: "(Idle)",
            invisible: "(Invisible)",
            offline: "(Invisible)",
            online: "(Online)",
            unknown: "(Unknown)"
        };

        const member = ctx.guild!.members.cache.get(user.id) ?? await ctx.guild!.members.fetch(user.id).catch(() => undefined);
        const game = member?.presence?.activities.find(x => x.type === "PLAYING");

        const embed = Util.createEmbed("info")
            .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }))
            .setAuthor({ name: `${user.username} - Discord User` })
            .addField("**DETAILS**", `\`\`\`asciidoc
• Username :: ${user.tag}
• ID       :: ${user.id}
• Created  :: ${user.createdAt.toString()}
• Joined   :: ${member?.joinedAt?.toString() ?? "Unknown"}\`\`\``)
            .addField("**STATUS**", `\`\`\`asciidoc
• Type     :: ${user.bot ? "Beep Boop, Boop Beep?" : "I'm not a robot."}
• Presence :: ${status[member?.presence?.status ?? "unknown"]} ${game ? game.name : "No game detected."}\`\`\``)
            .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() })
            .setTimestamp();
        return ctx.send({ embeds: [embed] });
    }
}
