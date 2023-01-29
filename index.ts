import { Client, Events, GatewayIntentBits } from 'discord.js';
import * as fs from 'fs';

let config: any = {};

if (fs.existsSync('./config.json')) {
    // load config
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    if (!config.bot_token) {
        console.log('Please fill in the bot token in config.json and restart the bot.');
        process.exit();
    }
} else {
    // create config
    config = { bot_token: '' };
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
    console.log('Generated config.json. Please fill in the bot token and restart the bot.');
    process.exit();
}

const client = new Client({ intents: [ 
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
]});

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(config.bot_token);