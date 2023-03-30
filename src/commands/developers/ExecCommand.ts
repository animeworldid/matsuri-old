/* eslint-disable no-eval */
import { CommandOptions, Command, ApplicationCommandRegistry, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandOptionType } from "discord.js";
import { Util } from "../../utils/Util";
import { exec } from "child_process";
import { guildsToRegister } from "../../config";

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
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "input",
                    type: ApplicationCommandOptionType.String,
                    description: "Linux command code",
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
        const input = interaction.options.getString("input", true);
        await interaction.deferReply();

        const m = await interaction.editReply(`❯_ ${input}`);
        exec(input, async (e: any, stdout: any, stderr: any) => {
            if (e) return m.edit(`\`\`\`js\n${(e as Error).message}\`\`\``);
            if (!stderr && !stdout) return m.edit("Executed without result.");
            if (stdout) {
                const pages = Util.paginate(stdout as string, 1950);
                for (const page of pages) {
                    await interaction.editReply(`\`\`\`\n${page}\`\`\``);
                }
            }
            if (stderr) {
                const pages = Util.paginate(stderr as string, 1950);
                for (const page of pages) {
                    await interaction.editReply(`\`\`\`\n${page}\`\`\``);
                }
            }
        });
    }
}
