import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { StringSelectMenuInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Util } from "../../utils/Util";
import { Anilist, AnilistAnime } from "../../utils/Anilist";
import { SelectMenuCustomIds } from "../../constants";

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
        const data = result.data;
        const animeEmbed = Util.createEmbed("info")
            .setThumbnail(data.coverImage.large)
            .setTitle(data.title.romaji)
            .setDescription(Anilist.stripHtmlTag(data.description ?? "No Description"))
            .addFields(
                {
                    name: "Status",
                    value: `${data.status?.charAt(0).toUpperCase() ?? ""}${data.status?.slice(1).toLowerCase().replaceAll("_", " ") ?? ""}`,
                    inline: true
                },
                {
                    name: "Genres",
                    value: data.genres?.join(", ") ?? "-"
                },
                {
                    name: "Start Date",
                    value: Anilist.parseAnimeDate(data.startDate) ?? "-",
                    inline: true
                },
                {
                    name: "End Date",
                    value: Anilist.parseAnimeDate(data.endDate) ?? "-",
                    inline: true
                },
                {
                    name: "Episodes",
                    value: data.episodes?.toString() ?? "-",
                    inline: true
                },
                {
                    name: "Anilist",
                    value: data.id ? `https://anilist.co/anime/${data.id}` : "-"
                },
                {
                    name: "MAL",
                    value: data.idMal ? `https://myanimelist.net/anime/${data.idMal}` : "-"
                }

            )
            .setTimestamp()
            .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        return interaction.editReply({ embeds: [animeEmbed] });
    }
}
