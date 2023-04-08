import { ActivityOptions, ClientPresenceStatus } from "discord.js";
import { Util as AdditionalUtil } from "../utils/Util";

export interface MembershipPayload {
    avatarURL: string;
    id: string;
    username: string;
    discriminator: string;
    color: string;
}

export interface IPresenceData {
    activities: ActivityOptions[];
    status: ClientPresenceStatus[];
    interval: number;
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        ownerOnly: never;
        adminOnly: never;
    }
}

declare module "discord.js" {
    interface Client {
        util: AdditionalUtil;
    }
}
