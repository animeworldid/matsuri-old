import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { ActivityType, ApplicationCommandOptionType } from "discord.js";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";

@ApplyOptions<Command.Options>({
    aliases: ["infouser", "user", "users", "uinfo"],
    name: "userinfo",
    description: "Check the user information",
    detailedDescription: {
        usage: "{prefix}userinfo [@mention | id]"
    },
    requiredClientPermissions: ["EmbedLinks"]
})
export class UserinfoCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
                    description: "User to view"
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
        const user = interaction.options.getUser("user") ?? interaction.user;

        const status = {
            dnd: "(Do Not Disturb)",
            idle: "(Idle)",
            invisible: "(Invisible)",
            offline: "(Invisible)",
            online: "(Online)",
            unknown: "(Unknown)"
        };

        const member = interaction.guild!.members.cache.get(user.id) ?? await interaction.guild!.members.fetch(user.id).catch(() => undefined);
        const game = member?.presence?.activities.find(x => x.type === ActivityType.Playing);

        const embed = Util.createEmbed("info")
            .setThumbnail(user.displayAvatarURL({ extension: "png", size: 2048 }))
            .setAuthor({ name: `${user.username} - Discord User` })
            .addFields(
                {
                    name: "**DETAILS**",
                    value: `\`\`\`asciidoc
• Username :: ${user.tag}
• ID       :: ${user.id}
• Created  :: ${user.createdAt.toString()}
• Joined   :: ${member?.joinedAt?.toString() ?? "Unknown"}\`\`\``
                },
                {
                    name: "**STATUS**",
                    value: `\`\`\`asciidoc
• Type     :: ${user.bot ? "Beep Boop, Boop Beep?" : "I'm not a robot."}
• Presence :: ${status[member?.presence?.status ?? "unknown"]} ${game ? game.name : "No game detected."}\`\`\``
                }
            )
            .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        return interaction.reply({ embeds: [embed] });
    }
}
