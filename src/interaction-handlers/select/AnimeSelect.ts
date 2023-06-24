import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Anilist, AnilistAnime } from "../../utils/Anilist.js";
import { SelectMenuCustomIds } from "../../constants/index.js";
import { AnimeResponseBuilder } from "../../utils/responseBuilder/AnimeResponseBuilder.js";
@ApplyOptions<InteractionHandler.Options>({
    interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class AnimeSelectHandler extends InteractionHandler {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    public override async parse(interaction: StringSelectMenuInteraction) {
        if (interaction.customId !== SelectMenuCustomIds.Anime) return this.none();

        await interaction.deferUpdate();
        const anilist = new Anilist();
        const data = await anilist.getAnimeById(parseInt(interaction.values[0]));
        if (!data) return this.none();
        return this.some({ data });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, class-methods-use-this
    public override async run(interaction: StringSelectMenuInteraction, result: { data: AnilistAnime }) {
        return interaction.editReply({ embeds: AnimeResponseBuilder(result.data, interaction.user) });
    }
}
