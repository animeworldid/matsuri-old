import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import { Guild } from "../constants";

@ApplyOptions<Listener.Options>({
    event: "guildMemberRemove"
})
export class GuildMemberRemoveListener extends Listener {
    public run(member: GuildMember): any {
        if (member.guild.id === Guild.Primary) {
            this.container.client.util.publishPrimaryGuildStats();
        }
    }
}

