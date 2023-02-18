import { ContextMenuCommandBuilder, ApplicationCommandType, ContextMenuCommandInteraction, GuildTextBasedChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder  } from 'discord.js';
const { getArchiveChannel } = require('./archive');
import { tempReply } from '../temp_reply';

module.exports = {
	isGlobal: false,
	type: 'MESSAGE',
	data: new ContextMenuCommandBuilder()
        .setName('archive_message')
        .setType(ApplicationCommandType.Message),
	async execute(interaction: ContextMenuCommandInteraction) {

        if (!interaction.guild) {
            await interaction.reply('ERROR - This command can only be used in a guild.');
            return;
        }

        const archive_channel: string | GuildTextBasedChannel = getArchiveChannel(interaction.guild.id);
        if (typeof archive_channel === 'string') {
            await interaction.reply(archive_channel);
            return;
        }

        // copy message to archive channel then send a button linking to the original message and the referenced message if there is one
        const message = interaction.options.getMessage('message');
        if (message && message.guild) {
            // create poster embed
            const poster_icon = message.author.avatarURL();
            const channel = interaction.channel as GuildTextBasedChannel;
            if (!channel) {
                await interaction.reply('ERROR - channel not found!');
                return;
            }
            const poster_embed = new EmbedBuilder();
            if (poster_icon)
                poster_embed.setFooter({ iconURL: poster_icon, text: `${message.author.username} in ${channel.name}` })
            else {
                poster_embed.setFooter({ text: `${message.author.username} in ${channel.name}` });
            }
            poster_embed.setTimestamp(message.createdAt);
            // create message content
            var message_content = message.content;
            if (message.attachments) {
                message_content += '\n';
                message.attachments.forEach(attachment => {
                    message_content += attachment.url + '\n';
                });
            }
            // create buttons
            const row = new ActionRowBuilder<ButtonBuilder>();
            row.addComponents(
				new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(message.url)
					.setLabel('Jump to Message'));
            if (message.reference) {
                row.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.reference.messageId}`)
					    .setLabel('Jump to Referenced Message'));
            }
            await archive_channel.send({ embeds: [poster_embed] });
            await archive_channel.send(message_content);
            await archive_channel.send({ components: [row] });
            tempReply(interaction, 'Message archived!');
        } else {
            await interaction.reply('ERROR - message or guild not found!');
        }
	},
};
