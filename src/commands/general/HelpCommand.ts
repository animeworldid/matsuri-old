import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandContext, ContextCommand } from "@frutbits/command-context";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { guildsToRegister, isDev as isDevMode, prefix } from "../../config";
import { Images } from "../../constants";
import { Util } from "../../utils/Util";

@ApplyOptions<Command.Options>({
    aliases: ["command", "commands", "cmd", "cmds"],
    name: "help",
    description: "Shows command list or information for specific command",
    requiredClientPermissions: ["EMBED_LINKS"]
})
export class HelpCommand extends ContextCommand {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "command",
                    type: ApplicationCommandOptionTypes.STRING,
                    description: "Command name to check detailed info",
                    required: false
                }
            ]
        }, {
            guildIds: isDevMode ? guildsToRegister : [],
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    public async contextRun(ctx: CommandContext): Promise<any> {
        const args = ctx.isMessageContext() ? await ctx.args?.pickResult("string") : undefined;
        const cmdArgs = args?.value ?? (ctx.isCommandInteractionContext() ? ctx.options.getString("command") : undefined) ?? "";
        const command = this.container.client.stores.get("commands").get(cmdArgs) ??
            [...this.container.client.stores.get("commands").values()].find(x => x.aliases.includes(cmdArgs));
        if (command) {
            return ctx.send({
                embeds: [
                    Util.createEmbed("info")
                        .setThumbnail(Images.QUESTION_MARK)
                        .setAuthor({ name: `Information for ${command.name} command`, iconURL: this.container.client.user!.displayAvatarURL()! })
                        .addFields([
                            { name: "Name", value: `**\`${command.name}\`**`, inline: false },
                            { name: "Description", value: command.description, inline: true },
                            {
                                name: "Aliases",
                                value: `${Number(command.aliases.length) > 0 ? command.aliases.map(c => `**\`${c}\`**`).join(", ")! : "None."}`,
                                inline: false
                            },
                            // eslint-disable-next-line
                            { name: "Usage", value: `**\`${(Object(command.detailedDescription).usage ?? "No usage was provided").replace(/{prefix}/g, prefix)}\`**`, inline: true }
                        ])
                        .setFooter({
                            // @ts-expect-error-next-line
                            text: `<> = required | [] = optional ${command.preconditions.entries.find(x => x.name === "ownerOnly") ? "(developer-only command)" : ""}`,
                            iconURL: Images.INFORMATION
                        })
                ]
            }).catch(e => this.container.client.logger.error("PROMISE_ERR:", e));
        }
        const embed = Util.createEmbed("info")
            .setThumbnail(Images.AWI_LOGO)
            .setAuthor({ name: `${this.container.client.user!.username} - Command List` })
            .setFooter({
                text: `${prefix}help <command> to get more info on a specific command.`,
                iconURL: Images.INFORMATION
            });
        for (const category of [...new Set(this.container.stores.get("commands").map(x => x.fullCategory[x.fullCategory.length - 1]))]) {
            const cmds = this.container.stores.get("commands")
                .filter(c => category === c.category)
                .map(c => `**\`${c.name}\`**`);
            if (cmds.length === 0) continue;
            embed.addField(`**${category.split(" ")
                .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
                .join(" ")}**`, cmds.join(", "));
        }
        ctx.send({ embeds: [embed] }).catch(e => this.container.client.logger.error("PROMISE_ERR:", e));
    }
}
