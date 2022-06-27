import { SapphireClient } from "@sapphire/framework";
import { ClientOptions } from "discord.js";
import * as constants from "../constants";
import { Util } from "../utils/Util";

export class BotClient extends SapphireClient {
    public readonly util = new Util(this);
    public readonly constants = constants;
    public constructor(opt: ClientOptions) {
        super(opt);
    }
}
