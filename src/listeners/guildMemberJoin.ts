import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { Guild } from "../constants/index.js";

@ApplyOptions<Listener.Options>({
    event: "guildMemberJoin"
})
export class GuildMemberJoinListener extends Listener {
    public run(member: GuildMember): any {
        if (member.guild.id === Guild.Primary) {
            this.container.client.util.publishPrimaryGuildStats();
        }
    }
}

