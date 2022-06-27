import { ClientPresenceStatus } from "discord.js";
import { IPresenceData } from "./typings";

export const devs: string[] = JSON.parse(process.env.CONFIG_DEVS ?? "[]");
export const guildsToRegister = JSON.parse(process.env.CONFIG_GUILD_TO_REGISTER ?? "[]");
export const isDev = process.env.NODE_ENV === "DEVELOPMENT";
export const prefix = process.env.CONFIG_PREFIX!;
export const presenceData: IPresenceData = {
    activities: [
        { name: "discord.gg/otakuid", type: "WATCHING" }
    ],
    status: ["online"] as ClientPresenceStatus[],
    interval: 60000
};

if (typeof process.env.CONFIG_PREFIX !== "string") throw new Error("CONFIG_PREFIX must be a string");
if (typeof process.env.NODE_ENV !== "string" || !["DEVELOPMENT", "PRODUCTION"].includes(process.env.NODE_ENV)) throw new Error("NODE_ENV must be a either DEVELOPMENT or PRODUCTION");

