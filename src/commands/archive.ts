import { ChatInputCommandInteraction, SlashCommandBuilder, GuildTextBasedChannel, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { tempReply } from '../temp_reply';
import { Config } from '../config';
import { App } from '../app';

function getArchiveChannel(guildId: string): GuildTextBasedChannel | string {

    // get guild from config
    const config_guild = Config.data.guilds.find(g => g.id === guildId);
    if (!config_guild) {
        return 'ERROR - could not get guild! try restarting the bot.';
    }
    if (!config_guild.archiveChannelId || config_guild.archiveChannelId === '') {
        return 'ERROR - Archive channel is not set. You can set one by using `/archive set_channel`';
    }

    // get guild from guildId
    const guild = App.client.guilds.cache.get(guildId);
    if (!guild) {
        return 'ERROR - could not get guild!';
    }

    // get archive channel from archive_channel_id
    const archive_channel = guild.channels.cache.get(config_guild.archiveChannelId) as GuildTextBasedChannel;
    if (!archive_channel) {
        return 'ERROR - archive channel no longer exist! You can set a new one by using `/archive set_channel`';
    }

    // if archive channel is not a text channel, reply with error
    if (archive_channel.type !== ChannelType.GuildText) {
        return 'ERROR - archive channel is not a text channel! You can set a proper one by using `/archive set_channel`';
    }

    return archive_channel;
}

module.exports = {
	isGlobal: false,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('archive')
		.setDescription('Parent command for archive related commands. For the context menu see "archive_message"')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set_channel')
                .setDescription('Sets the archive channel for the guild.')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel to set as the archive channel.')
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand
                .setName('last_message')
                .setDescription('Archives the most recent message in the channel.')
    ),
    getArchiveChannel,
	async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply('ERROR - This command can only be used in a guild.');
            return;
        }

        if (interaction.options.getSubcommand() === 'set_channel') {

            if (!Config.data.adminWhitelist.includes(interaction.user.id)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            const archive_channel = interaction.options.getChannel('channel');
            if (archive_channel && archive_channel.type === ChannelType.GuildText) {

                // get index of guild in config
                const guild_index = Config.data.guilds.findIndex(g => g.id === interaction.guild?.id);
                if (guild_index === -1) {
                    await interaction.reply('ERROR - guild not found! try restarting the bot.');
                    return;
                }

                // set archive channel id in config
                Config.data.guilds[guild_index].archiveChannelId = archive_channel.id;
                Config.save();

                tempReply(interaction, 'Archive channel set!');

            } else {
                tempReply(interaction, 'ERROR - channel is not a text channel!');
            }
        } else if (interaction.options.getSubcommand() === 'last_message') {
            const archive_channel: GuildTextBasedChannel | string = getArchiveChannel(interaction.guild.id);
            if (typeof archive_channel === 'string') {
                await interaction.reply(archive_channel);
                return;
            }
            if (!interaction.channel) {
                await interaction.reply('ERROR - channel not found!');
                return;
            }
            // copy message to archive channel then send a button linking to the original message and the referenced message if there is one
            const message = interaction.channel.messages.cache.first();
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
        }
	},
};
