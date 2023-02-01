import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

module.exports = {
	isGlobal: true,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');
	},
};
