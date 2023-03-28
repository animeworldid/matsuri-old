import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

import { guildsToRegister } from "../../config";
import { Anilist } from "../../utils/Anilist";
import { SelectMenuCustomIds } from "../../constants";
import { AnimeResponseBuilder } from "../../utils/responseBuilder/AnimeResponseBuilder";
@ApplyOptions<Command.Options>({
    aliases: [],
    name: "anime",
    description: "Search anime information",
    detailedDescription: {
        usage: "{prefix}anime [text]"
    },
    requiredClientPermissions: ["EmbedLinks"]
})
export class AnimeCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "title",
                    type: ApplicationCommandOptionType.String,
                    description: "Anime title to find",
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
        const animeTitle = interaction.options.getString("title", true);
        try {
            await interaction.deferReply();
            const anilist = new Anilist();
            const data = await anilist.findAnimeByTitle(animeTitle);
            if (!data) return await interaction.editReply("Nothing found");
            const firstMedia = data.media[0];
            if (data.media.length === 1) return await interaction.editReply({ embeds: AnimeResponseBuilder(firstMedia, interaction.user) });
            const rowOptions = data.media.map(currentMedia => {
                const status = `${currentMedia.status?.charAt(0).toUpperCase() ?? ""}${currentMedia.status?.slice(1).toLowerCase().replaceAll("_", " ") ?? ""}`;
                const episodes = currentMedia.episodes?.toString() ?? 0;
                const genres = currentMedia.genres?.join(", ") ?? "";
                const description = `${status}, ${currentMedia.startDate ? `${Anilist.parseAnimeDate(currentMedia.startDate) ?? "Unknown"}, ` : ""}${currentMedia.episodes ? `${episodes} episodes, ` : ""}${currentMedia.genres ? genres : ""}`;
                return {
                    label: currentMedia.title.romaji,
                    description: Anilist.stripHtmlTag(description.slice(0, 90)),
                    value: currentMedia.id.toString()
                };
            });
            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(SelectMenuCustomIds.Anime)
                        .setPlaceholder(`Search result: ${data.media.length}`)
                        .addOptions(rowOptions)
                );
            return await interaction.editReply({ embeds: AnimeResponseBuilder(firstMedia, interaction.user), components: [row] });
        } catch (err) {
            await interaction.editReply({
                content: "No result found."
            });
            throw err;
        }
    }
}
