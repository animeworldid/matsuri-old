import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { ChannelType, Presence } from "discord.js";
import { amqpUrl, presenceData } from "../config.js";

@ApplyOptions<Listener.Options>({
    once: true,
    event: "ready"
})
export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, options);
    }

    public run(): any {
        this.doPresence();
        this.container.client.logger.info(this.formatString("{username} is ready to serve {users.size} users on {guilds.size} guilds in " +
        "{textChannels.size} text channels and {voiceChannels.size} voice channels!"));

        if (amqpUrl !== undefined) {
            const payload = this.container.client.util.fetchMembership();
            this.container.client.amqpWebsite.publish("", "MEMBERSHIP_UPDATE", payload);
            this.container.client.util.publishPrimaryGuildStats();
        }
    }

    private formatString(text: string): string {
        return text
            .replace(/{users.size}/g, (this.container.client.users.cache.size - 1).toString())
            .replace(/{textChannels.size}/g, this.container.client.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size.toString())
            .replace(/{guilds.size}/g, this.container.client.guilds.cache.size.toString())
            .replace(/{username}/g, this.container.client.user!.username)
            .replace(/{voiceChannels.size}/g, this.container.client.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size.toString());
    }

    private setPresence(random: boolean): Presence {
        const activityNumber = random ? Math.floor(Math.random() * presenceData.activities.length) : 0;
        const statusNumber = random ? Math.floor(Math.random() * presenceData.status.length) : 0;
        const activity = presenceData.activities.map(a => Object.assign(a, { name: this.formatString(a.name!) }))[activityNumber];

        return this.container.client.user!.setPresence({
            activities: [activity],
            status: presenceData.status[statusNumber]
        });
    }

    private doPresence(): Presence | undefined {
        try {
            return this.setPresence(false);
        } catch (e: any) {
            if ((e as Error).message !== "Shards are still being spawned.") this.container.client.logger.error(e);
            return undefined;
        } finally {
            setInterval(() => this.setPresence(true), presenceData.interval);
        }
    }
}
