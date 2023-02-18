import { Events, IntentsBitField, Partials } from 'discord.js';
import { GuiSite } from './gui_site/gui_site';
import { Config } from './config';
import { App } from './app';

Config.load();

App.init(
    {intents: [ 
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages
    ], 
    partials: [
        Partials.Channel
    ]},
    Config.data.botToken
);

App.loadCommands();

App.client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    
    Config.data.clientId = c.user.id;
    Config.save();

    if (process.argv.includes('-init')) { App.updateGlobalCommands(); }

    App.updateGuilds();
    App.client.on(Events.GuildCreate, guild => { App.updateGuilds(); });
    App.client.on(Events.GuildDelete, guild => { App.updateGuilds(); });

    GuiSite.init();

    App.client.on(Events.InteractionCreate, async interaction => {
        if (App.isUpdating) return;
    
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            const command = App.commands.get(interaction.commandName);
            if (!command) {
                console.error(`Command ${interaction.commandName} not found.`); 
                return;
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }

    });
});

App.client.login(Config.data.botToken);