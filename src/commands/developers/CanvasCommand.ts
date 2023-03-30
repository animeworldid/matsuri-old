/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eval */
import { Command, ApplicationCommandRegistry, RegisterBehavior, Result } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandOptionType, AttachmentBuilder, BufferResolvable, EmbedBuilder, Message } from "discord.js";
import { Util } from "../../utils/Util";
import { readFileSync } from "fs";
import { join } from "path";
import { Canvas as SCanvas, resolveImage } from "canvas-constructor/napi-rs";
import { cast } from "@sapphire/utilities";
import { guildsToRegister } from "../../config";

@ApplyOptions<Command.Options>({
    aliases: ["cv"],
    name: "canvas",
    description: "Test a canvas-contructor code",
    detailedDescription: {
        usage: "{prefix}canvas <some canvas code>"
    },
    preconditions: ["ownerOnly"],
    requiredClientPermissions: ["SendMessages", "EmbedLinks", "AttachFiles"]
})
export class CanvasCommand extends Command {
    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registry.registerChatInputCommand({
            name: this.name,
            description: this.description,
            options: [
                {
                    name: "input",
                    type: ApplicationCommandOptionType.String,
                    description: "Canvas code",
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
        const Canvas = SCanvas;
        const ping = Date.now();
        const embed = new EmbedBuilder();
        let code = `\`\`\`js\n${input}\`\`\``;
        if (code.length > 1024) {
            code = await Util.hastebin(input);
        }

        embed.addFields({
            name: "📥 INPUT",
            value: code
        });
        let value = input;
        try {
            const avatar = await resolveImage(readFileSync(join(process.cwd(), "assets", "images", "dummy_avatar.png")));
            if (!value.startsWith("new Canvas")) throw new Error("the command cannot execute without new Canvas(high, width)");
            if (!value.includes(".pngAsync()")) value += ".pngAsync()";

            code.replace(/;/g, "");

            // eslint-disable-next-line no-eval
            const evaled: BufferResolvable = await eval(value);
            embed.setColor("#00FF12")
                .addFields({
                    name: "📤 OUTPUT",
                    value: "\u200B"
                })
                .setImage("attachment://canvas.png")
                .setFooter({ text: `⏱️ ${Date.now() - ping}ms` });
            return await interaction.editReply({
                embeds: [embed],
                files: [
                    new AttachmentBuilder(evaled, { name: "canvas.png" })
                ]
            });
        } catch (e: any) {
            let err = `\`\`\`ini\n${cast<Error>(e).stack!}\`\`\``;
            if (err.length > 1024) err = await Util.hastebin(cast<Error>(e).stack!);

            embed.setColor("#FF1200")
                .addFields({
                    name: "⛔ ERROR",
                    value: err
                })
                .setFooter({ text: `⏱️ ${Date.now() - ping}ms` });
            return await interaction.editReply({ embeds: [embed] });
        }
    }
}
