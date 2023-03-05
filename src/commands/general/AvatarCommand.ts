import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplicationCommandOptionType } from "discord.js";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";

@ApplyOptions<Command.Options>({
    aliases: [],
    name: "avatar",
    description: "Check someone's avatar",
    detailedDescription: {
        usage: "{prefix}avatar [@mention | id]"
    },
    requiredClientPermissions: ["EmbedLinks"]
})
export class AvatarCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "user",
                    type: ApplicationCommandOptionType.User,
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
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<any> {
        const user = interaction.options.getUser("user", true);

        const embed = Util.createEmbed("info")
            .setImage(user.displayAvatarURL({ extension: "png", size: 4096 }))
            .setAuthor({ name: `${user.username}'s avatar` })
            .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        return interaction.reply({ embeds: [embed] });
    }
}
