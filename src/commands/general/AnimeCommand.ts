import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior, Result } from "@sapphire/framework";
import { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { toTitleCase } from "@sapphire/utilities";
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
        await interaction.deferReply();
        const anilist = new Anilist();
        const data = (await Result.fromAsync(anilist.findAnimeByTitle(animeTitle))).unwrap();
        if (!data?.media[0]) return interaction.editReply(`No result found for ${animeTitle}.`);
        if (data.media.length === 1) return interaction.editReply({ embeds: AnimeResponseBuilder(data.media[0], interaction.user) });

        const rowOptions = data.media.map(currentMedia => {
            const status = toTitleCase(currentMedia.status?.replaceAll("_", " ") ?? "Unknown");
            const episodes = currentMedia.episodes?.toString();
            const genres = currentMedia.genres?.join(", ");
            const startDate = Anilist.parseAnimeDate(currentMedia.startDate);
            const description = `${status}, ${startDate ? `${startDate}, ` : ""}${episodes ? `${episodes} episodes, ` : ""}${genres ?? ""}`;
            return {
                label: Anilist.truncateText(currentMedia.title.romaji, 100),
                description: Anilist.truncateText(Anilist.stripHtmlTag(description), 100),
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
        return interaction.editReply({ embeds: AnimeResponseBuilder(data.media[0], interaction.user), components: [row] });
    }
}
