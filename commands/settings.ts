import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

module.exports = {
    isGlobal: true,
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Links a settings menu for the bot.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('wip');
	},
};
