// Sapphire Plugins
import "@frutbits/pino-logger/register";
import "@sapphire/plugin-editable-commands/register";

import { BucketScope } from "@sapphire/framework";
import "dotenv/config";
import process from "node:process";
import { devs, isDev, prefix } from "./config.js";
import { BotClient } from "./structures/BotClient.js";
import { Intents } from "discord.js";
import { resolve } from "node:path";
import { Util } from "./utils/Util.js";

const date = Util.formatDate(Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour12: false
}));

const client = new BotClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES
    ],
    loadMessageCommandListeners: true,
    fetchPrefix: () => prefix,
    defaultCooldown: {
        delay: 10_000,
        filteredUsers: devs,
        limit: 2,
        scope: BucketScope.Channel
    },
    logger: {
        pino: {
            name: "bot",
            timestamp: true,
            level: isDev ? "debug" : "info",
            formatters: {
                bindings: () => ({
                    pid: "Bot"
                })
            },
            transport: {
                targets: [
                    { target: "pino/file", level: "info", options: { destination: resolve(process.cwd(), "logs", `bot-${date}.log`) } },
                    { target: "pino-pretty", level: isDev ? "debug" : "info", options: { translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o" } }
                ]
            }
        }
    }
});

process.on("unhandledRejection", e => {
    client.logger.error(e);
});

process.on("uncaughtException", e => {
    client.logger.fatal(e);
    process.exit(1);
});

client.login(process.env.DISCORD_TOKEN).catch(e => client.logger.error(e));

