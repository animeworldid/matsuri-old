/* eslint-disable @typescript-eslint/no-base-to-string */
import { Colors, ColorResolvable, EmbedBuilder } from "discord.js";
import { request } from "https";
import prettyMilliseconds from "pretty-ms";
import { embedInfoColor, Emojis } from "../constants";
import { BotClient } from "../structures/BotClient";

type hexColorsType = "error" | "info" | "success" | "warn";
const hexColors: Record<hexColorsType, ColorResolvable> = {
    error: Colors.Red,
    info: embedInfoColor,
    success: Colors.Green,
    warn: Colors.Yellow
};

export class Util {
    public constructor(public readonly client: BotClient) {}

    public static formatDate(dateFormat: Intl.DateTimeFormat, date: Date | number = new Date()): string {
        const data = dateFormat.formatToParts(date);
        return "<year>-<month>-<day>"
            .replace(/<year>/g, data.find(d => d.type === "year")!.value)
            .replace(/<month>/g, data.find(d => d.type === "month")!.value)
            .replace(/<day>/g, data.find(d => d.type === "day")!.value);
    }

    public static formatMS(ms: number): string {
        if (isNaN(ms)) throw new Error("value is not a number.");
        return prettyMilliseconds(ms, {
            verbose: true,
            compact: false,
            secondsDecimalDigits: 0
        });
    }

    public static createEmbed(type: hexColorsType, message?: string, emoji = false): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(hexColors[type]);

        if (message) embed.setDescription(message);
        if (type === "error" && emoji) embed.setDescription(`${Emojis.No} **|** ${message!}`);
        if (type === "success" && emoji) embed.setDescription(`${Emojis.Yes} **|** ${message!}`);
        return embed;
    }

    public static paginate(text: string, limit = 2000): string[] {
        const lines = text.trim().split("\n");
        const pages = [];
        let chunk = "";

        for (const line of lines) {
            if (chunk.length + line.length > limit && chunk.length > 0) {
                pages.push(chunk);
                chunk = "";
            }

            if (line.length > limit) {
                const lineChunks = line.length / limit;

                for (let i = 0; i < lineChunks; i++) {
                    const start = i * limit;
                    const end = start + limit;
                    pages.push(line.slice(start, end));
                }
            } else {
                chunk += `${line}\n`;
            }
        }

        if (chunk.length > 0) {
            pages.push(chunk);
        }

        return pages;
    }

    public static chunk<T>(arr: T[], len: number): T[][];
    public static chunk(arr: string, len: number): string[];
    public static chunk(...args: any[]): any[] {
        const [arr, len] = args as [any, number];
        const rest: (typeof arr)[] = [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        for (let i = 0; i < arr.length; i += len) { rest.push(arr.slice(i, i + len)); }
        return rest;
    }

    public static bytesToSize(bytes: number): string {
        if (isNaN(bytes) && bytes !== 0) throw new Error(`[bytesToSize] (bytes) Error: bytes is not a Number/Integer, received: ${typeof bytes}`);
        const sizes: string[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
        if (bytes < 2 && bytes > 0) return `${bytes} Byte`;
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0) return `${bytes} ${sizes[i]}`;
        if (!sizes[i]) return `${bytes} ${sizes[sizes.length - 1]}`;
        return `${Number(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    public static hastebin(text: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.frutbits.org", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.frutbits.org/${(JSON.parse(raw) as { key: string }).key}`);
                    return reject(
                        new Error("[hastebin] Error while trying to send data to https://bin.frutbits.org/documents," +
                        `${res.statusCode!.toString()} ${res.statusMessage!.toString()}`)
                    );
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }
}
