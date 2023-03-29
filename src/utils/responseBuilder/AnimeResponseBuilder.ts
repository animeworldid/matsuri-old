import { EmbedBuilder, User, hyperlink } from "discord.js";
import { Anilist, AnilistAnime } from "../Anilist";
import { Util } from "../Util";
import { toTitleCase } from "@sapphire/utilities";
import { Emojis } from "../../constants";

export function AnimeResponseBuilder(data: AnilistAnime, user: User): EmbedBuilder[] {
    const externalLink = [
        hyperlink(`${Emojis.ANILIST} AniList`, `https://anilist.co/anime/${data.id}`),
        hyperlink(`${Emojis.MAL} MyAnimeList`, `https://myanimelist.net/anime/${data.idMal ?? ""}`)
    ].join(" | ");
    const animeEmbed = Util.createEmbed("info")
        .setThumbnail(data.coverImage.large)
        .setTitle(data.title.romaji)
        .setDescription(Anilist.stripHtmlTag(data.description ?? "No Description"))
        .addFields(
            {
                name: "Status",
                value: `${toTitleCase(data.status?.replaceAll("_", " ") ?? "")}`,
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
                name: "Links",
                value: externalLink
            }
        )
        .setTimestamp()
        .setFooter({ text: `Replying to: ${user.tag}`, iconURL: user.displayAvatarURL() });
    return [animeEmbed];
}
