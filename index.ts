import { Events, GatewayIntentBits, Partials } from 'discord.js';
import { GuiSite } from './gui_site';
import { Config } from './config';
import { App } from './app';
import * as path from 'path';
import * as fs from 'fs';

Config.load();

App.init(
    {intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages 
    ], 
    partials: [
        Partials.Channel
    ]},
    Config.data.botToken
);

App.loadCommands();

if (process.argv.includes('-init')) { App.updateGlobalCommands(); }

App.client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    App.updateGuilds();
    App.client.on(Events.GuildCreate, guild => { App.updateGuilds(); });
    App.client.on(Events.GuildDelete, guild => { App.updateGuilds(); });

    GuiSite.init();

    App.client.on(Events.InteractionCreate, async interaction => {
        if (App.isUpdating) return;
    
        if (interaction.isChatInputCommand()) {
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