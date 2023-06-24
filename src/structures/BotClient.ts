import { SapphireClient } from "@sapphire/framework";
import { ClientOptions } from "discord.js";
import * as constants from "../constants/index.js";
import { Util } from "../utils/Util.js";
import { createAmqp, RoutingPublisher } from "@nezuchan/cordis-brokers";
import { amqpUrl } from "../config.js";

export class BotClient extends SapphireClient {
    public readonly util = new Util(this);
    public readonly constants = constants;
    public amqpWebsite!: RoutingPublisher<string, ReturnType<Util["fetchMembership"]>>;
    public constructor(opt: ClientOptions) {
        super(opt);
    }

    public async login(token?: string | undefined): Promise<string> {
        if (amqpUrl !== undefined) {
            const { channel } = await createAmqp(amqpUrl);
            this.amqpWebsite = new RoutingPublisher(channel);
            await this.amqpWebsite.init({ durable: true, name: "WEBSITE", exchangeType: "topic", useExchangeBinding: true });
        }

        return super.login(token);
    }
}

declare module "@sapphire/framework" {
    interface SapphireClient {
        amqpWebsite: RoutingPublisher<string, ReturnType<Util["fetchMembership"]>>;
    }
}
