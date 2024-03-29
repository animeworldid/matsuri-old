import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { Interaction, Message } from "discord.js";
import { devs } from "../config.js";

@ApplyOptions<PreconditionOptions>({
    name: "ownerOnly"
})
export class ownerOnly extends Precondition {
    public messageRun(message: Message): PreconditionResult {
        return devs.includes(message.author.id) ? this.ok() : this.error({ message: "Only bot owner can do this" });
    }

    public chatInputRun(interaction: Interaction): PreconditionResult {
        return devs.includes(interaction.user.id) ? this.ok() : this.error({ message: "Only bot owner can do this" });
    }
}
