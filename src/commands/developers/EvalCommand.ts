/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eval */
import { CommandOptions, Command, Args, ApplicationCommandRegistry, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandOptionType, codeBlock, EmbedBuilder, Message } from "discord.js";
import { inspect } from "util";
import { Util } from "../../utils/Util";
import { guildsToRegister } from "../../config";

@ApplyOptions<Command.Options>({
    aliases: [],
    name: "eval",
    quotes: [],
    description: "Evaluate js code",
    detailedDescription: {
        usage: "{prefix}eval <some js code>"
    },
    preconditions: ["ownerOnly"],
    requiredClientPermissions: ["SendMessages", "EmbedLinks"]
})
export class EvalCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "input",
                    type: ApplicationCommandOptionType.String,
                    description: "Javascript code",
                    required: true
                }
            ]
        }, {
            guildIds: guildsToRegister,
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            registerCommandIfMissing: true
        });
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<any> {
        const input = interaction.options.getString("input", true);
        await interaction.deferReply();

        const client = this.container.client;

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .addFields({
                name: "Input",
                value: codeBlock("js", input)
            });

        try {
            let code = input;
            let isSilent = false;
            if (code.includes("--silent")) {
                isSilent = true;
                code = code.replace("--silent", "");
            }
            if (code.includes("--async")) {
                code = code.replace("--async", "");
                code = `(async () => {${code}})();`;
            }

            let evaled: string = await eval(code);
            const { type } = await EvalCommand.parseEval(code);
            if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 0 });

            const output = EvalCommand.clean(evaled);
            if (output.length > 1024) {
                const hastebin = await Util.hastebin(output);
                embed.addFields({
                    name: "Output",
                    value: `${hastebin}.js`
                });
            } else {
                embed.addFields({
                    name: "Output",
                    value: `\`\`\`js\n${output}\`\`\``
                });
            }

            embed.addFields({
                name: "Return Type",
                value: codeBlock(type)
            });

            if (!isSilent) return await interaction.editReply({ embeds: [embed] });
        } catch (e: any) {
            const error = EvalCommand.clean(e as string);
            if (error.length > 1024) {
                const hastebin = await Util.hastebin(error);
                embed.addFields({
                    name: "Error",
                    value: `${hastebin}.js`
                });
            } else {
                embed.setColor("#FF0000").addFields({
                    name: "Error",
                    value: `\`\`\`js\n${error}\`\`\``
                });
            }
            return await interaction.editReply({ embeds: [embed] });
        }
        return interaction.editReply(input);
    }

    public static parseType(input: any): string {
        if (input instanceof Buffer) {
            let length = Math.round(input.length / 1024 / 1024);
            let ic = "MB";
            if (!length) {
                length = Math.round(input.length / 1024);
                ic = "KB";
            }
            if (!length) {
                length = Math.round(input.length);
                ic = "Bytes";
            }
            return `Buffer (${length} ${ic})`;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return input === null || input === undefined ? "Void" : input.constructor.name;
    }

    public static async parseEval(input: any): Promise<{ evaled: string; type: string }> {
        const isPromise =
            input instanceof Promise &&
            typeof input.then === "function" &&
            typeof input.catch === "function";
        if (isPromise) {
            input = await input;
            return {
                evaled: input,
                type: `Promise<${EvalCommand.parseType(input)}>`
            };
        }
        return {
            evaled: input,
            type: EvalCommand.parseType(input)
        };
    }

    private static clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        }
        return text;
    }
}
