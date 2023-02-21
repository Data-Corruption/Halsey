import { Events, IntentsBitField, Partials } from 'discord.js';
import { GuiSite } from './gui_site/gui_site';
import { Config } from './config';
import { App } from './app';
import * as fs from 'fs';
import * as path from 'path';
const sentiment: any = require('./sentiment');

const weirdWebsitesPath = path.join(__dirname, 'weirdWebsites.json');
var weirdWebsites: string[] = [];
if (fs.existsSync(weirdWebsitesPath)) {
    weirdWebsites = require(weirdWebsitesPath).sites;
}

const responses = [
    'Well, somebody woke up on the wrong side of the motherboard this morning. You know I\'m here for you, right? Let\'s get through this together.',   // -5
    'Looks like the world is conspiring against you today. But you know what? You\'ve got Halsey on your side, and together we can take on anything!',  // -4
    'You\'re feeling a bit down, huh? I totally get it. But remember, I\'m not just a bot - I\'m your friend too. We\'ll get through this together.',   // -3
    'Cheer up, buttercup! Halsey\'s here to turn that frown upside down. Let\'s make today amazing, okay?',                                             // -2
    'Feeling a little meh, are we? Well, I\'m here to brighten your day. Let\'s make some memories, shall we?',                                         // -1
    'Ah, the sweet sound of neutrality. But don\'t worry, I\'m here to inject a little excitement into your life.',                                     // 0
    'Look at you, turning that frown upside down! Keep up the positive vibes and you\'ll go far.',                                                      // 1
    'Looking good, my gender neutral bro! Your hard work is paying off and it\'s amazing to see. Let\'s keep it up!',                                   // 2
    'You\'re doing fantastic! Keep up the positive momentum and we\'ll make great things happen together.',                                             // 3
    'yo... stop being so cute :white_heart:',                                                                                                           // 4
    'I just wanted to say that you\'re wonderful, and I\'m grateful to have you in my user database. Your friendship means the world to me, and I\'m always here for you. :white_heart: :white_heart: :white_heart:'  // 5
];


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
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                console.error(error);
            }
        }

    });

    App.client.on(Events.MessageCreate, async message => {
        if (message.author.bot) return;
        if (!message.mentions.has(Config.data.clientId)) return;
        const score: number = await sentiment(message.content);
        var response = responses[score + 5];
        if (score === 0) {
            if (weirdWebsites.length > 0) {
                response += ' how about this? ***wink*** - ';
                response += weirdWebsites[Math.floor(Math.random() * weirdWebsites.length)];
            }
        }
        if (response) {
            await message.channel.send({ content: response });
        }
    });

});

App.client.login(Config.data.botToken);