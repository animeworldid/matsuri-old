import { SapphireClient } from "@sapphire/framework";
import { ClientOptions } from "discord.js";
import * as constants from "../constants/index.js";
import { Util } from "../utils/Util.js";
import { amqpUrl } from "../config.js";
import { connect, Channel } from "amqplib";

export class BotClient extends SapphireClient {
    public readonly util = new Util(this);
    public readonly constants = constants;
    public amqp!: Channel;
    public constructor(opt: ClientOptions) {
        super(opt);
    }

    public async login(token?: string | undefined): Promise<string> {
        if (amqpUrl !== undefined) {
            const conn = await connect(amqpUrl);
            this.amqp = await conn.createChannel();
        }

        return super.login(token);
    }
}

declare module "@sapphire/framework" {
    interface SapphireClient {
        amqp: Channel;
    }
}
