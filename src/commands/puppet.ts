import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Config } from '../config';

module.exports = {
	isGlobal: false,
	type: 'CHAT_INPUT',
	data: new SlashCommandBuilder()
		.setName('puppet')
		.setDescription('Speak through the bot. (Admin only)')
        .addStringOption(option => option.setName('message').setDescription('The message to send.').setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction) {
        
        if (!Config.data.adminWhitelist.includes(interaction.user.id)) {
			await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
			return;
		}

        // get the channel the command was sent in
        const channel = interaction.channel;
        // get the message
        var message = interaction.options.getString('message');

        // if channel and message is not null or undefined then send the message
        if (channel && message) {
            // replace all instances of \n with a new line
            message = message.replace(/\\n/g, '\n');
            // send the message in a way that retains the new lines
            await channel.send({ content: message });
            await interaction.reply({ content: 'Message sent!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an issue and the message could not be sent.', ephemeral: true });
        }

	},
};
