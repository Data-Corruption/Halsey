import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Config } from '../config';

module.exports = {
	isGlobal: false,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription('Bookmarks a link (each guild has their own bookmarks)')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the bookmark')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('link')
				.setDescription('The link to be bookmarked')
				.setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
		const bookmarkName = interaction.options.getString('name', true);
		const bookmarkLink = interaction.options.getString('link', true);
		if (!bookmarkName || !bookmarkLink) {
			await interaction.reply('Error: Missing required arguments!');
			return;
		}
		// get the guild index
		const guildIndex = Config.data.guilds.findIndex(guild => guild.id === interaction.guildId);
		if (guildIndex === -1) {
			await interaction.reply('Error: Guild not found in config! try restarting the bot.');
			return;
		}
		// check if the guild has any bookmarks, if not, create the array
		if (!Config.data.guilds[guildIndex].bookmarks) {
			Config.data.guilds[guildIndex].bookmarks = [ { name: bookmarkName, url: bookmarkLink } ];
			Config.save();
			await interaction.reply(`Bookmark \`${bookmarkName}\` set to \`${bookmarkLink}\``);
			return;
		}
		// check if the bookmark already exists
		const bookmarkIndex = Config.data.guilds[guildIndex].bookmarks.findIndex(bookmark => bookmark.name === bookmarkName);
		if (bookmarkIndex !== -1) {
			// update the bookmark with the new link
			Config.data.guilds[guildIndex].bookmarks[bookmarkIndex].url = bookmarkLink;
			Config.save();
			await interaction.reply(`Bookmark \`${bookmarkName}\` updated to \`${bookmarkLink}\``);
		} else {
			// add the bookmark to the array
			Config.data.guilds[guildIndex].bookmarks.push({ name: bookmarkName, url: bookmarkLink });
			Config.save();
			await interaction.reply(`Bookmark \`${bookmarkName}\` set to \`${bookmarkLink}\``);
		}
	}
}