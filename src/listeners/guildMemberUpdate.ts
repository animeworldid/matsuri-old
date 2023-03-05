import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { Roles, Guild, Channels } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "guildMemberUpdate"
})
export class GuildMemberUpdateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(oldMember: GuildMember, newMember: GuildMember): Promise<any> {
        if (newMember.guild.id === Guild.PRIMARY) {
            /**
             * Check if member boosted the server
             */
            const hadRole = oldMember.roles.cache.has(Roles.BOOSTER);
            const hasRole = newMember.roles.cache.has(Roles.BOOSTER);
            const isPremium = newMember.roles.cache.has(Roles.PREMIUM);
            const isDonator = newMember.roles.cache.has(Roles.DONATOR);
            if (!hadRole && hasRole) {
                const channel = await newMember.guild.channels.fetch(Channels.BOOSTER_NOTIFICATION);
                if (channel?.isTextBased() && !channel.isVoiceBased()) await channel.send(`Thank you ${newMember.user.toString()} for boosting Anime World Indonesia!`);
                if (!isPremium) await newMember.roles.add(Roles.PREMIUM, "Add AWI Premium after boosting");
            } else if (hadRole && !hasRole && isPremium && !isDonator) {
                await newMember.roles.remove(Roles.PREMIUM, "Removed AWI Premium after losing boost");
            }
        }
    }
}
