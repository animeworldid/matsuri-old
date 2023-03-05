/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Events, Identifiers, Listener, MessageCommandDeniedPayload, UserError } from "@sapphire/framework";
import { cast } from "@sapphire/utilities";
import { APIEmbed, ChannelType, MessageCreateOptions, PermissionsString, TextChannel } from "discord.js";
import { Util } from "../../utils/Util";

export class MessageCommandDeniedListener extends Listener<typeof Events.MessageCommandDenied> {
    // eslint-disable-next-line class-methods-use-this
    public override async run({ context, message: content, identifier }: UserError, { message }: MessageCommandDeniedPayload): Promise<any> {
        if (Reflect.get(Object(context), "silent")) return;
        const payload: MessageCreateOptions = {
            embeds: [
                Util.createEmbed("error", content, true)
            ]
        };
    
        const cooldownRemaining = Reflect.get(Object(context), "remaining") as number | undefined;
        if (cooldownRemaining && identifier === Identifiers.PreconditionCooldown) {
            payload.embeds = [
                Util.createEmbed("error", `**${message.author.username}**, please wait **${(cooldownRemaining / 1000).toFixed(1)}** cooldown time.`, true)
            ];
        }

        const missingPerms = Reflect.get(Object(context), "missing") as PermissionsString[] | undefined;
        if (missingPerms && [Identifiers.PreconditionClientPermissions, Identifiers.PreconditionUserPermissions].includes(identifier as Identifiers)) {
            payload.embeds = [
                Util.createEmbed("error", `${identifier === Identifiers.PreconditionClientPermissions ? "I am" : "You are"} missing the following permissions to run this command:\n\`\`\`diff\n${missingPerms.map(x => `- ${x}`).join("\n")}\`\`\``, true)
            ];
        }

        if (message.channel.type !== ChannelType.DM) {
            if (!message.channel.permissionsFor(message.guild!.members.me!).has("EmbedLinks")) {
                payload.content = cast<APIEmbed>(payload.embeds![0]).description;
                payload.embeds = [];
            }
        }

        const msg = await cast<TextChannel>(message.channel).send({
            ...payload,
            allowedMentions: { users: [message.author.id], roles: [] }
        });
        if (Reflect.get(Object(context), "deleteTimeout")) {
            setTimeout(async () => {
                if (msg.deletable) await msg.delete();
            }, Reflect.get(Object(context), "deleteTimeout"));
        }
    }
}
