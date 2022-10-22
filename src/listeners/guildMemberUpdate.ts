import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { autoRole, Roles, Guild, Channels } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "guildMemberUpdate"
})
export class GuildMemberUpdateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(oldMember: GuildMember, newMember: GuildMember): Promise<any> {
        if (newMember.guild.id === Guild.PRIMARY) {
            if (oldMember.pending && !newMember.pending) {
                for (const role of autoRole) {
                    if (newMember.roles.cache.has(role)) continue;
                    await new Promise(res => setTimeout(() => res(true), 1_500));
                    await newMember.roles.add(role, "Auto-role after accepting rules screening");
                }
            }

            /**
             * Check if member boosted the server
             */
            const hadRole = oldMember.roles.cache.has(Roles.BOOSTER);
            const hasRole = newMember.roles.cache.has(Roles.BOOSTER);
            const isPremium = newMember.roles.cache.has(Roles.PREMIUM);
            const isDonator = newMember.roles.cache.has(Roles.DONATOR);
            if (!hadRole && hasRole) {
                const channel = await newMember.guild.channels.fetch(Channels.BOOSTER_NOTIFICATION);
                if (channel?.isText()) await channel.send(`Thank you ${newMember.user.toString()} for boosting Anime World Indonesia!`);
                if (!isPremium) await newMember.roles.add(Roles.PREMIUM, "Add AWI Premium after boosting");
            } else if (hadRole && !hasRole && isPremium && !isDonator) {
                await newMember.roles.remove(Roles.PREMIUM, "Removed AWI Premium after losing boost");
            }
        }
    }
}
