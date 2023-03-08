/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-eval */
import { CommandOptions, Command, Args } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AttachmentBuilder, BufferResolvable, EmbedBuilder, Message } from "discord.js";
import { Util } from "../../utils/Util";
import { readFileSync } from "fs";
import { join } from "path";
import { Canvas as SCanvas, resolveImage } from "canvas-constructor/skia";
import { cast } from "@sapphire/utilities";

@ApplyOptions<CommandOptions>({
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
    // eslint-disable-next-line class-methods-use-this
    public async messageRun(message: Message, args: Args): Promise<any> {
        const Canvas = SCanvas;
        const input = await args.restResult("string");
        if (message.channel.isVoiceBased()) return;
        const ping = Date.now();
        let value = input.unwrapOr(undefined);
        if (!value) {
            return message.channel.send({
                embeds: [
                    Util.createEmbed("error", "Please provide a code!", true)
                ]
            });
        }

        const embed = new EmbedBuilder();
        let code = `\`\`\`js\n${value}\`\`\``;
        if (code.length > 1024) {
            code = await Util.hastebin(input.unwrapOr(undefined));
        }

        embed.addFields({
            name: "📥 INPUT",
            value: code
        });

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
            return await message.channel.send({
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
            return message.channel.send({ embeds: [embed] });
        }
    }
}
