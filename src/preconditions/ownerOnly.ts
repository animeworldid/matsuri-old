import { ApplyOptions } from "@sapphire/decorators";
import { PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandContext, ContextPrecondition } from "@frutbits/command-context";
import { devs } from "../config.js";

@ApplyOptions<PreconditionOptions>({
    name: "ownerOnly"
})
export class ownerOnly extends ContextPrecondition {
    public contextRun(ctx: CommandContext): PreconditionResult {
        return devs.includes(ctx.author.id) ? this.ok() : this.error({ message: "Only bot owner can do this" });
    }
}
