import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Config } from './config';
import * as path from 'path';
import * as fs from 'fs';

class MyClient extends Client {
    isUpdating: boolean = false;
    commands: Map<string, any>;
    rest: any;
    constructor(options: any, botToken: string) {
        super(options);
        this.commands = new Map();
        this.rest = new REST({ version: '10' }).setToken(botToken);
    };
    loadCommands() {
        const commandFiles = fs.readdirSync(Config.commandsFolderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(Config.commandsFolderPath, file));
            if (client.commands.get(command.data.name)) {
                console.error(`Command ${command.data.name} already exists.`);
                process.exit(1);
            }
            if (!(command.data || command.execute)) {
                console.warn(`Command ${file} is missing data or execute.`);
                process.exit(1);
            }
            this.commands.set(command.data.name, command);
        }
    };
    updateGuilds() {
        const guilds = this.guilds.cache;
        // if bot is in a guild that's not in config.json, add it to the config and log a warning.
        for (const guild of guilds.values()) {
            if (!Config.guilds.find(g => g.id === guild.id)) {
                Config.guilds.push({ id: guild.id, commands: [] });
                console.warn(`Bot is in guild ${guild.id}, that guild is not in the config, adding it now.`);
            }
        }
        // if bot is not in a guild that is in config.json, log a warning.
        for (const guild of Config.guilds) {
            if (!guilds.find(g => g.id === guild.id)) {
                console.warn(`Bot is not in ${guild.id}, please add it to the guild or remove it from config.`);
            }
        }
        Config.save();
    }
    updateGlobalCommands() {
        const commandsData = [];
        for (const command of this.commands.values()) {
            if (command.isGlobal === true) {
                commandsData.push(command.data.toJSON());
            }
        }
        (async () => {
            try {
                console.log(`Updating ${commandsData.length} global application (/) commands.`);
                const data = await this.rest.put(Routes.applicationCommands(Config.clientId), { body: commandsData });
                console.log(`Successfully updated ${commandsData.length} global application (/) commands.`);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        })();
    };
    updateGuildCommands(guildID: string) {
        if (!this.guilds.cache.find(g => g.id === guildID)) {
            console.error(`Bot is not in guild ${guildID}.`);
            return;
        }
        const guild = Config.guilds.find(g => g.id === guildID);
        if (!guild) {
            console.error(`Guild ${guildID} not found in config.json.`);
            return;
        }
        const commandWhitelist = guild.commands;
        const commandsData = [];
        for (const command of this.commands.values()) {
            if (commandWhitelist.includes(command.data.name) && command.isGlobal !== true) {
                commandsData.push(command.data.toJSON());
            }
        }
        (async () => {
            try {
                console.log(`Updating ${commandsData.length} guild application (/) commands in ${guild.id}.`);
                const data = await this.rest.put(Routes.applicationGuildCommands(Config.clientId, guildID), { body: commandsData });
                console.log(`Successfully updated ${guild.id}'s guild application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    };
}

Config.load();

const client = new MyClient(
    {intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages 
    ], 
    partials: [
        'CHANNEL'
    ]},
    Config.botToken
);

client.loadCommands();

if (process.argv.includes('-init')) { client.updateGlobalCommands(); }

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    client.updateGuilds();
    client.on(Events.GuildCreate, guild => { client.updateGuilds(); });
    client.on(Events.GuildDelete, guild => { client.updateGuilds(); });

    client.on(Events.InteractionCreate, async interaction => {
        if (client.isUpdating) return;
    
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
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

client.login(Config.botToken);