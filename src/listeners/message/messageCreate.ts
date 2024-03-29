import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { Message, MessageType } from "discord.js";
import { Channels, Guild } from "../../constants/index.js";

@ApplyOptions<Listener.Options>({
    event: "messageCreate"
})

export class MessageCreateListener extends Listener<typeof Events.MessageCreate> {
    // eslint-disable-next-line class-methods-use-this
    public override async run(message: Message): Promise<any> {
        if (message.guild!.id !== Guild.Primary) return;
        if (message.type !== MessageType.GuildBoost) return;
        const notifChannel = await message.guild!.channels.fetch(Channels.BoosterNotification);
        if (!notifChannel?.isTextBased() || notifChannel.isVoiceBased()) return;
        return notifChannel.send(`Thank you ${message.author.toString()} for boosting Anime World Indonesia!`);
    }
}
