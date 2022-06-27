import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { Interaction, Message } from "discord.js";
import { CustomID, Emojis } from "../constants";
import { Util } from "../utils/Util";

@ApplyOptions<Listener.Options>({
    event: "interactionCreate"
})
export class InteractionCreateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(interaction: Interaction): Promise<any> {
        if (interaction.isModalSubmit() && interaction.customId === CustomID.SUGGESTION_MODAL) {
            const msg = await interaction.reply({
                fetchReply: true,
                embeds: [
                    Util.createEmbed("info")
                        .addField("Submitter", `${interaction.user.tag} (${interaction.user.toString()})`)
                        .addField("Suggestion", interaction.components[0].components[0].value)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 4096, format: "png" }))
                        .setFooter({ text: `User ID: ${interaction.user.id}` })
                ]
            });
            if (msg instanceof Message) {
                await msg.react(Emojis.YES);
                await msg.react(Emojis.NO);
            }
        }
    }
}
