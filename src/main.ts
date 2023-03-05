// Sapphire Plugins
import "@frutbits/pino-logger/register";
import "@sapphire/plugin-editable-commands/register";

import { BucketScope } from "@sapphire/framework";
import "dotenv/config";
import process from "node:process";
import { devs, isDev, prefix } from "./config.js";
import { BotClient } from "./structures/BotClient.js";
import { GatewayIntentBits } from "discord.js";

const client = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences
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

