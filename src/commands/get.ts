import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

module.exports = {
	isGlobal: false,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('Get\'s a bookmarked link (each guild has their own bookmarks)'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('wip!');
	},
};
