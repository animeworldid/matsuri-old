/* eslint-disable no-eval */
import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import { send } from "@sapphire/plugin-editable-commands";
import { Util } from "../../utils/Util";
import { exec } from "child_process";

@ApplyOptions<CommandOptions>({
    aliases: [],
    name: "exec",
    quotes: [],
    description: "Execute a bash command",
    detailedDescription: {
        usage: "{prefix}exec <bash>"
    },
    preconditions: ["ownerOnly"],
    requiredClientPermissions: ["SendMessages", "EmbedLinks"]
})
export class ExecCommand extends Command {
    // eslint-disable-next-line class-methods-use-this
    public async messageRun(message: Message<true>, args: Args): Promise<any> {
        if (message.channel.isVoiceBased()) return;
        const input = await args.restResult("string");
        if (!input.isOk()) {
            return send(message, {
                embeds: [
                    Util.createEmbed("error", "Please provide a valid input!", true)
                ]
            });
        }

        const m = await message.channel.send(`❯_ ${input.unwrap()}`);
        exec(input.unwrap(), async (e: any, stdout: any, stderr: any) => {
            if (e) return m.edit(`\`\`\`js\n${(e as Error).message}\`\`\``);
            if (!stderr && !stdout) return m.edit("Executed without result.");
            if (message.channel.isVoiceBased()) return;
            if (stdout) {
                const pages = Util.paginate(stdout as string, 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            }
            if (stderr) {
                const pages = Util.paginate(stderr as string, 1950);
                for (const page of pages) {
                    await message.channel.send(`\`\`\`\n${page}\`\`\``);
                }
            }
        });
    }
}
