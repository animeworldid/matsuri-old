import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { Roles, Guild, autoRole } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "guildMemberUpdate"
})
export class GuildMemberUpdateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(oldMember: GuildMember, newMember: GuildMember): Promise<any> {
        if (newMember.guild.id === Guild.PRIMARY) {
            /**
             * Add default roles upon join and pass screening
             */
            if (oldMember.pending && !newMember.pending) {
                return newMember.roles.add(autoRole);
            }

            /**
             * Check if member boosted the server
             */
            const wasBoosting = oldMember.roles.cache.has(Roles.BOOSTER);
            const isBoosting = newMember.roles.cache.has(Roles.BOOSTER);
            const isPremium = newMember.roles.cache.has(Roles.PREMIUM);
            const wasDonator = oldMember.roles.cache.has(Roles.DONATOR);
            const isDonator = newMember.roles.cache.has(Roles.DONATOR);

            if (!wasBoosting && isBoosting) {
                if (!isPremium) return newMember.roles.add(Roles.PREMIUM, "Add AWI Premium after boosting");
            } else if (!isPremium && !wasDonator && isDonator) {
                await newMember.roles.add(Roles.PREMIUM, "Add AWI Premium after donating");
            } else if (wasBoosting && !isBoosting) {
                if (!isDonator) return newMember.roles.remove(Roles.PREMIUM, "Removed AWI Premium after losing boost");
            } else if (wasDonator && !isDonator) {
                if (!isBoosting) return newMember.roles.remove(Roles.PREMIUM, "Removed AWI Premium after donation expired");
            }
        }
    }
}

