import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";
import { MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from "discord.js";
import { Channels, CustomID } from "../../constants";
import { TextInputStyles } from "discord.js/typings/enums";

@ApplyOptions<Command.Options>({
    aliases: [],
    name: "suggest",
    description: "Submit a suggestion or feedback about this server",
    chatInputCommand: {
        register: true
    },
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class SuggestCommand extends ContextCommand {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: []
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    // eslint-disable-next-line class-methods-use-this
    public async contextRun(ctx: CommandContext): Promise<any> {
        if (ctx.channelId !== Channels.SUGGESTION) {
            return ctx.send({
                embeds: [
                    Util.createEmbed("error", `You must run this command in <#${Channels.SUGGESTION}>!`, true)
                ],
                ephemeral: true
            }).then(x => {
                if (ctx.isMessageContext()) setTimeout(() => x.delete(), 5_000);
            });
        }
        if (ctx.isCommandInteractionContext()) {
            return ctx.showModal(
                new Modal()
                    .setCustomId(CustomID.SUGGESTION_MODAL)
                    .setTitle("Suggestion & Feedback Form")
                    .addComponents(
                        new MessageActionRow<ModalActionRowComponent>()
                            .addComponents(
                                new TextInputComponent()
                                    .setCustomId("suggestionInput")
                                    .setLabel("Your suggestion & feedback")
                                    .setStyle(TextInputStyles.PARAGRAPH)
                            )
                    )
            );
        }

        return ctx.send({
            embeds: [
                Util.createEmbed("error", "Sorry, you need to run this command with slash command (/suggest)")
            ]
        }).then(x => setTimeout(() => x.delete(), 10_000));
    }
}
