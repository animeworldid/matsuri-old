/* eslint-disable @typescript-eslint/no-base-to-string */
import { ColorResolvable, MessageEmbed, PermissionString } from "discord.js";
import { request } from "https";
import prettyMilliseconds from "pretty-ms";
import { embedInfoColor, Emojis } from "../constants";
import { BotClient } from "../structures/BotClient";

type hexColorsType = "error" | "info" | "success" | "warn";
const hexColors: Record<hexColorsType, string> = {
    error: "RED",
    info: embedInfoColor,
    success: "GREEN",
    warn: "YELLOW"
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

    public static createEmbed(type: hexColorsType, message?: string, emoji = false): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor(hexColors[type] as ColorResolvable);

        if (message) embed.setDescription(message);
        if (type === "error" && emoji) embed.setDescription(`${Emojis.NO} **|** ${message!}`);
        if (type === "success" && emoji) embed.setDescription(`${Emojis.YES} **|** ${message!}`);
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

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public static readonly readablePermissions: Record<PermissionString, string> = {
        ADD_REACTIONS: "Add Reactions",
        ADMINISTRATOR: "Administrator",
        ATTACH_FILES: "Attach Files",
        BAN_MEMBERS: "Ban Members",
        CHANGE_NICKNAME: "Change Nickname",
        CONNECT: "Connect",
        CREATE_INSTANT_INVITE: "Create Instant Invite",
        CREATE_PRIVATE_THREADS: "Create Private Threads",
        CREATE_PUBLIC_THREADS: "Create Public Threads",
        DEAFEN_MEMBERS: "Deafen Members",
        EMBED_LINKS: "Embed Links",
        KICK_MEMBERS: "Kick Members",
        MANAGE_CHANNELS: "Manage Channels",
        MANAGE_EMOJIS_AND_STICKERS: "Manage Emojis and Stickers",
        MANAGE_EVENTS: "Manage Events",
        MANAGE_GUILD: "Manage Server",
        MANAGE_MESSAGES: "Manage Messages",
        MANAGE_NICKNAMES: "Manage Nicknames",
        MANAGE_ROLES: "Manage Roles",
        MANAGE_THREADS: "Manage Threads",
        MANAGE_WEBHOOKS: "Manage Webhooks",
        MENTION_EVERYONE: "Mention Everyone",
        MODERATE_MEMBERS: "Moderate Members",
        MOVE_MEMBERS: "Move Members",
        MUTE_MEMBERS: "Mute Members",
        PRIORITY_SPEAKER: "Priority Speaker",
        READ_MESSAGE_HISTORY: "Read Message History",
        REQUEST_TO_SPEAK: "Request to Speak",
        SEND_MESSAGES_IN_THREADS: "Send Messages in Threads",
        SEND_MESSAGES: "Send Messages",
        SEND_TTS_MESSAGES: "Send TTS Messages",
        SPEAK: "Speak",
        START_EMBEDDED_ACTIVITIES: "Start Activities",
        STREAM: "Stream",
        USE_APPLICATION_COMMANDS: "Use Application Commands",
        USE_EXTERNAL_EMOJIS: "Use External Emojis",
        USE_EXTERNAL_STICKERS: "Use External Stickers",
        USE_PRIVATE_THREADS: "Use Private Threads",
        USE_PUBLIC_THREADS: "Use Public Threads",
        USE_VAD: "Use Voice Activity",
        VIEW_AUDIT_LOG: "View Audit Log",
        VIEW_CHANNEL: "Read Messages",
        VIEW_GUILD_INSIGHTS: "View Guild Insights"
    };
}
