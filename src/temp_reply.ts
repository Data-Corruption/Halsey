import { ChatInputCommandInteraction, ContextMenuCommandInteraction } from 'discord.js';

/** Defaults - ephemeral: false, timeout: 5000 "5 seconds" */
export function tempReply(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, content: string, ephemeral?: boolean, timeout?: number) {
    interaction.reply({ content: content, ephemeral: ephemeral }).then(() => {
        setTimeout(() => {
            try {
                interaction.deleteReply();
            } catch (error) {
                console.log(error);
            }
        }, timeout ? timeout : 5000);
    });
}