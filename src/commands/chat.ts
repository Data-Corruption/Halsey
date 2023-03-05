import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { tempReply } from '../temp_reply';
import { Config } from '../config';

module.exports = {
	isGlobal: true,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Parent command for chat related commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('whitelist_add')
                .setDescription('Adds a user to the chat whitelist.')
                .addUserOption(option =>
					option
						.setName('user')
						.setDescription('The user to add to the whitelist.')
						.setRequired(true)
				)
        )
		.addSubcommand(subcommand =>
			subcommand
				.setName('whitelist_remove')
				.setDescription('Removes a user from the chat whitelist.')
				.addUserOption(option =>
					option
						.setName('user')
						.setDescription('The user to remove from the whitelist.')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
            subcommand
                .setName('usage_policy')
                .setDescription('Links the usage policy and has a button to agree to it if you have not already.')
    ), 
	async execute(interaction: ChatInputCommandInteraction) {
		if (interaction.options.getSubcommand() === 'whitelist_add') {
			// if user is not an admin, return
			if (!Config.data.adminWhitelist.includes(interaction.user.id)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }
			// get user from options
			const user = interaction.options.getUser('user');
			// if user is not in whitelist, add them
			if (user) {
				if (Config.data.chatWhitelist.find(u => u.id === user.id)) {
					tempReply(interaction, 'That user is already whitelisted!');
					return;
				}
				Config.data.chatWhitelist.push({ id: user.id, signedUsagePolicy: false });
				Config.save();
				tempReply(interaction, `Added ${user.username} to the chat whitelist.`);
			}
			return;
		}
		if (interaction.options.getSubcommand() === 'whitelist_remove') {
			// if user is not an admin, return
			if (!Config.data.adminWhitelist.includes(interaction.user.id)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }
			// get user from options
			const user = interaction.options.getUser('user');
			// if user is in whitelist, remove them
			if (user) {
				const user_index = Config.data.chatWhitelist.findIndex(u => u.id === user.id);
				if (user_index === -1) {
					tempReply(interaction, 'That user is not whitelisted!');
					return;
				}
				Config.data.chatWhitelist.splice(user_index, 1);
				Config.save();
				tempReply(interaction, `Removed ${user.username} from the chat whitelist.`);
			}
			return;
		}
		if (interaction.options.getSubcommand() === 'usage_policy') {
			// if user is not in whitelist, return
			let user = Config.data.chatWhitelist.find(u => u.id === interaction.user.id);
			if (!user) {
				tempReply(interaction, 'You are not whitelisted to use the chat bot.');
				return;
			}

			// create usage policy button link
			let row = new ActionRowBuilder<ButtonBuilder>();
			row.addComponents(
				new ButtonBuilder()
					.setLabel('Usage Policy')
					.setStyle(ButtonStyle.Link)
					.setURL('https://platform.openai.com/docs/usage-policies')
			);

			// if user has already signed usage policy, return
			if (!user.signedUsagePolicy) {
				// create agree button
				row.addComponents(
					new ButtonBuilder()
						.setLabel('I Agree to the Usage Policy')
						.setStyle(ButtonStyle.Primary)
						.setCustomId('openai_chat_usage_policy_agree')
				);
			}
			await interaction.reply({ components: [row], ephemeral: true });
		}
	},
};
