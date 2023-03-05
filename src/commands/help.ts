import { ChatInputCommandInteraction, SlashCommandBuilder, GuildTextBasedChannel, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { tempReply } from '../temp_reply';

module.exports = {
	isGlobal: true,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists commands and how to use them!'),
	async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder();
        embed.setThumbnail(interaction.client.user.avatarURL());
        embed.setTitle(`Hello ${interaction.user.username}`);
        embed.setDescription('Here are all my commands!');
        embed.addFields(
            {name: 'archive last_message', value: 'Archives the most recent message in the channel.', inline: true},
            {name: 'archive set_channel', value: 'Sets the archive channel for the guild. (admin only)', inline: true}
        );
        embed.addFields({name: '\u200b', value: '\u200b'});
        embed.addFields(
            {name: 'set', value: 'Sets a link bookmark.', inline: true},
            {name: 'get', value: 'Gets a link bookmark.', inline: true}
        );
        embed.addFields({name: '\u200b', value: '\u200b'});
        embed.addFields(
            {name: 'puppet', value: 'Speak through me, i don\'t mind, promise.', inline: true},
            {name: 'help', value: 'Lists commands and how to use them!', inline: true},
            {name: 'ping', value: 'Pong!', inline: true}
        );
        embed.addFields({name: '\u200b', value: '\u200b'});
        embed.addFields(
            {name: 'chat whitelist_add', value: 'Allow user to chat with me', inline: true},
            {name: 'chat whitelist_remove', value: 'Unallow user to chat with me', inline: true},
            {name: 'chat usage_policy', value: 'Links usage policy and button to agree if you have not already', inline: true}
        );
        embed.addFields({name: '\u200b', value: '\u200b'});
        embed.addFields({name: 'I almost forgot!', value: 'You can also use the context menu on a message to archive it!'});
        embed.addFields({name: '\u200b', value: '\u200b'});
        embed.addFields({name: 'Wha.. what... you wanna see my source code?', value: 'Ok, bu.. but don\'t do anything weird with it, baka [GitHub](https://github.com/Data-Corruption/Halsey) , [NPM](https://www.npmjs.com/package/halsey-bot)'});
        embed.setFooter({ text: 'btw @ me i might respond if ur cute <3'});
        embed.setColor('#C2999F');
        await interaction.reply({embeds: [embed], ephemeral: true});
	},
};
