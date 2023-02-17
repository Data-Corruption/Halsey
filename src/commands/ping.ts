import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

module.exports = {
	isGlobal: true,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!');

		// if subcommand "test"
		// if (interaction.options.getSubcommand() === 'test') {
	},
};
