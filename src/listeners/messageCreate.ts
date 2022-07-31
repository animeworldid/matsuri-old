import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";
import { Channels } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "messageCreate"
})
export class MessageCreateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(message: Message): Promise<any> {
        if (!message.member?.permissions.has("MANAGE_GUILD") && message.channelId === Channels.SUGGESTION && message.author.id !== this.container.client.user!.id) {
            if (message.deletable) await message.delete();
        }
    }
}
