import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { autoRole, Guild } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "guildMemberUpdate"
})
export class GuildMemberUpdateListener extends Listener {
    // eslint-disable-next-line class-methods-use-this
    public async run(oldMember: GuildMember, newMember: GuildMember): Promise<any> {
        if (newMember.guild.id === Guild.PRIMARY) {
            if (oldMember.pending && !newMember.pending) {
                for (const role of autoRole) {
                    await newMember.roles.add(role, "Auto-role after accepting rules screening");
                }
            }
        }
    }
}
