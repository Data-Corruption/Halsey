import { Client, ClientOptions, REST, Routes } from 'discord.js';
import { Config } from './config';
import * as path from 'path';
import * as fs from 'fs';

class App {
    public static isUpdating: boolean = false;
    public static commands: Map<string, any>;
    public static rest: any;
    public static client: Client;
    public static init(options: ClientOptions, botToken: string) {
        this.client = new Client(options);
        this.commands = new Map();
        this.rest = new REST({ version: '10' }).setToken(botToken);
    };
    public static loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if (this.commands.get(command.data.name)) {
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
    public static updateGuilds() {
        const guilds = this.client.guilds.cache;
        for (const guild of guilds.values()) {
            if (Config.data.guilds.find(g => g.id === guild.id) === undefined) {
                console.warn(`Bot is in guild ${guild.id}, that guild is not in the config, adding it now.`);
                Config.data.guilds.push({ id: guild.id, commandWhitelist: [] });
            }
        }
        for (const guild of Config.data.guilds) {
            if (guilds.find(g => g.id === guild.id) === undefined) {
                console.warn(`Bot is not in ${guild.id}, but the guild is in the config.`);
            }
        }
        Config.save();
    }
    public static updateGlobalCommands() {
        const commandsData = [];
        for (const command of this.commands.values()) {
            if (command.isGlobal === true) {
                commandsData.push(command.data.toJSON());
            }
        }
        (async () => {
            try {
                console.log(`Updating ${commandsData.length} global application (/) commands.`);
                const data = await this.rest.put(Routes.applicationCommands(Config.data.clientId), { body: commandsData });
                console.log(`Successfully updated ${commandsData.length} global application (/) commands.`);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        })();
    };
    public static updateGuildCommands(guildID: string) {
        if (!this.client.guilds.cache.find(g => g.id === guildID)) {
            console.error(`Bot is not in guild ${guildID}.`);
            return;
        }
        const guild = Config.data.guilds.find(g => g.id === guildID);
        if (!guild) {
            console.error(`Guild ${guildID} not found in config.json.`);
            return;
        }
        const commandWhitelist = guild.commandWhitelist;
        const commandsData = [];
        for (const command of this.commands.values()) {
            if (commandWhitelist.includes(command.data.name) && command.isGlobal === false) {
                commandsData.push(command.data.toJSON());
            }
        }
        (async () => {
            try {
                console.log(`Updating ${commandsData.length} guild application (/) commands in ${guild.id}.`);
                const data = await this.rest.put(Routes.applicationGuildCommands(Config.data.clientId, guildID), { body: commandsData });
                console.log(`Successfully updated ${guild.id}'s guild application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })();
    };
}

export { App };