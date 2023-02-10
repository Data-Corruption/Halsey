import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GuiSite } from '../gui_site';
import { Config } from '../config';

module.exports = {
    isGlobal: true,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Links a settings menu for the bot.'),
	async execute(interaction: ChatInputCommandInteraction) {

		if (!Config.data.guiSite.adminWhitelist.includes(interaction.user.id)) {
			await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
			return;
		}

		if (GuiSite.session.isValid()) {
			await interaction.reply({ content: 'Another user is already using the settings menu. Please try again in a few minutes.', ephemeral: true });
		} else {
			const row = new ActionRowBuilder<ButtonBuilder>()
				.addComponents(
					new ButtonBuilder()
						.setLabel('Settings Menu')
						.setStyle(ButtonStyle.Link)
						.setURL(`https://${Config.data.guiSite.domain}:${Config.data.guiSite.port}${Config.data.guiSite.botRoute}/settings/${GuiSite.session.create()}`)
				);
			await interaction.reply({ components: [row], ephemeral: true });
		}
	},
};
