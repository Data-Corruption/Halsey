import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { tempReply } from '../temp_reply';

module.exports = {
	isGlobal: true,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Pong!').then(() => {
			setTimeout(() => {
				interaction.deleteReply();
			}, 5000);
		});
		tempReply(interaction, 'Pong!');
	},
};
