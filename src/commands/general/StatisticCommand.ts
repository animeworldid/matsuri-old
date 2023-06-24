import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { version } from "discord.js";
import { guildsToRegister } from "../../config.js";
import { Util } from "../../utils/Util.js";
import { cpus, uptime } from "os";
import { Images } from "../../constants/index.js";
import { join } from "path";
import { readFileSync } from "fs";
import { cast } from "@sapphire/utilities";

@ApplyOptions<Command.Options>({
    aliases: ["statistic", "status"],
    name: "stats",
    description: "Show the bot statistic",
    requiredClientPermissions: ["EmbedLinks"]
})
export class StatisticCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<any> {
        const embed = Util.createEmbed("info")
            .setThumbnail(Images.AWILogo)
            .setAuthor({ name: `${this.container.client.user!.username} - Bot Statistic`, iconURL: this.container.client.user?.displayAvatarURL() })
            .addFields(
                {
                    name: "**STATIC**",
                    value: `**\`\`\`asciidoc
Users           :: ${this.container.client.users.cache.size}
Servers         :: ${this.container.client.guilds.cache.size}
Channels        :: ${this.container.client.channels.cache.size}
Shards          :: ${this.container.client.shard ? `${this.container.client.shard.count}` : "N/A"} - ID ${this.container.client.shard ? `${this.container.client.shard.ids[0]}` : "N/A"}
Node.js         :: ${process.version}
Discord.js      :: v${version}
Bot Version     :: v${cast<Record<string, string>>(JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))).version}\`\`\`**`
                },
                {
                    name: "**ENGINES**",
                    value: `**\`\`\`asciidoc
WS Ping         :: ${this.container.client.ws.ping.toFixed(0)} ms
CPU Usage       :: N/A
Mem. Usage      :: ${Util.bytesToSize(process.memoryUsage().rss)}
Platform - Arch :: ${process.platform} - ${process.arch}
Processor       :: ${cpus().length}x ${cpus()[0].model}\`\`\`**`
                },
                {
                    name: "**UPTIMES**",
                    value: `**\`\`\`asciidoc
Bot             :: ${Util.formatMS(this.container.client.uptime!)}
Process         :: ${Util.formatMS(process.uptime() * 1000)}
O/S             :: ${Util.formatMS(uptime() * 1000)}\`\`\`**`
                }
            )
            .setFooter({ text: `Replying to: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        await interaction.reply({ embeds: [embed] })
            .catch(e => this.container.client.logger.error("ABOUT_CMD_ERR:", e));
    }
}
