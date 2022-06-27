import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { version } from "discord.js";
import { guildsToRegister } from "../../config";
import { Util } from "../../utils/Util";
import { cpus, uptime } from "os";
import { Images } from "../../constants";
import { join } from "path";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { readFileSync } from "fs";
import { cast } from "@sapphire/utilities";

@ApplyOptions<Command.Options>({
    aliases: ["statistic", "status"],
    name: "stats",
    description: "Show the bot statistic",
    chatInputCommand: {
        register: true
    },
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class StatisticCommand extends ContextCommand {
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

    public async contextRun(ctx: CommandContext): Promise<any> {
        const embed = Util.createEmbed("info")
            .setThumbnail(Images.AWI_LOGO)
            .setAuthor({ name: `${this.container.client.user!.username} - Bot Statistic`, iconURL: this.container.client.user?.displayAvatarURL() })
            .addField("**STATIC**", `**\`\`\`asciidoc
Users           :: ${this.container.client.users.cache.size}
Servers         :: ${this.container.client.guilds.cache.size}
Channels        :: ${this.container.client.channels.cache.size}
Shards          :: ${this.container.client.shard ? `${this.container.client.shard.count}` : "N/A"} - ID ${this.container.client.shard ? `${this.container.client.shard.ids[0]}` : "N/A"}
Node.js         :: ${process.version}
Discord.js      :: v${version}
Bot Version     :: v${cast<Record<string, string>>(JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"))).version}\`\`\`**`)
            .addField("**ENGINES**", `**\`\`\`asciidoc
WS Ping         :: ${this.container.client.ws.ping.toFixed(0)} ms
CPU Usage       :: N/A
Mem. Usage      :: ${Util.bytesToSize(process.memoryUsage().rss)}
Platform - Arch :: ${process.platform} - ${process.arch}
Processor       :: ${cpus().length}x ${cpus()[0].model}\`\`\`**`)
            .addField("**UPTIMES**", `**\`\`\`asciidoc
Bot             :: ${Util.formatMS(this.container.client.uptime!)}
Process         :: ${Util.formatMS(process.uptime() * 1000)}
O/S             :: ${Util.formatMS(uptime() * 1000)}\`\`\`**`)
            .setFooter({ text: `Replying to: ${ctx.author.tag}`, iconURL: ctx.author.displayAvatarURL() });
        await ctx.send({ embeds: [embed] })
            .catch(e => this.container.client.logger.error("ABOUT_CMD_ERR:", e));
    }
}
