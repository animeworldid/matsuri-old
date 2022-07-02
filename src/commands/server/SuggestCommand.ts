import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";
import { MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from "discord.js";
import { Channels, CustomID, Emojis } from "../../constants";
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

        if (ctx.isMessageContext()) {
            await ctx.delete();
            const suggestion = await ctx.args?.restResult("string");
            if (!suggestion?.value || !suggestion.value.length) {
                return ctx.send({
                    embeds: [
                        Util.createEmbed("error", "Please provide a suggestion!", true)
                    ]
                }).then(x => {
                    if (ctx.isMessageContext()) setTimeout(() => x.delete(), 5_000);
                });
            }

            const msg = await ctx.send({
                embeds: [
                    Util.createEmbed("info")
                        .addField("Submitter", `${ctx.author.tag} (${ctx.author.toString()})`)
                        .addField("Suggestion", suggestion.value)
                        .setThumbnail(ctx.author.displayAvatarURL({ dynamic: true, size: 4096, format: "png" }))
                        .setFooter({ text: `User ID: ${ctx.author.id}` })
                ]
            });

            await msg.react(Emojis.YES);
            await msg.react(Emojis.NO);
        }
    }
}
