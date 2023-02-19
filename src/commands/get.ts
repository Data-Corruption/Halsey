import { ChatInputCommandInteraction, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Config } from '../config';

module.exports = {
	isGlobal: false,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('Get\'s a bookmarked link (each guild has their own bookmarks)')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the bookmark')
				.setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
		// get bookmark name
		const bookmarkName = interaction.options.getString('name');
		if (!bookmarkName) {
			await interaction.reply('Error: Bookmark name required!');
			return;
		}
		// get the guild index
		const guildIndex = Config.data.guilds.findIndex(guild => guild.id === interaction.guildId);
		if (guildIndex === -1) {
			await interaction.reply('Error: Guild not found in config! try restarting the bot.');
			return;
		}
		// check if the guild has any bookmarks
		if (!Config.data.guilds[guildIndex].bookmarks) {
			await interaction.reply('Error: Bookmark not found!');
			return;
		}
		// get the bookmarkIndex
		const bookmarkIndex = Config.data.guilds[guildIndex].bookmarks.findIndex(bookmark => bookmark.name === bookmarkName);
		if (bookmarkIndex === -1) {
			await interaction.reply('Error: Bookmark not found!');
			return;
		}
		const row = new ActionRowBuilder<ButtonBuilder>();
                row.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(Config.data.guilds[guildIndex].bookmarks[bookmarkIndex].url)
                        .setLabel(bookmarkName));
		await interaction.reply({ components: [row] });
	},
};
