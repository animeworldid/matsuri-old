import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";

@ApplyOptions<Command.Options>({
    aliases: [],
    name: "avatar",
    description: "Check someone's avatar",
    detailedDescription: {
        usage: "{prefix}avatar [@mention | id]"
    },
    chatInputCommand: {
        register: true
    },
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class AvatarCommand extends ContextCommand {
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

        const embed = Util.createEmbed("info")
            .setImage(user.displayAvatarURL({ dynamic: true, format: "png", size: 4096 }))
            .setAuthor({ name: `${user.username}'s avatar` })
            .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() });
        return ctx.send({ embeds: [embed] });
    }
}
