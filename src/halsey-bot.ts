import { ChannelType, Events, IntentsBitField, Message, Partials, TextChannel } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { GuiSite } from './gui_site/gui_site';
import { Config } from './config';
import { App } from './app';
import * as fs from 'fs';
import * as path from 'path';

var configuration: Configuration | undefined = undefined;
var openai: OpenAIApi | undefined = undefined;

async function respond(message: any, response: string) {
    if (message.channel.type === ChannelType.DM) {
        let user = await App.client.users.fetch(message.author.id);
        user.send(response);
    } else if (message.channel.type === ChannelType.GuildText) {
        let channel: TextChannel = await App.client.channels.fetch(message.channel.id) as TextChannel;
        if (!channel) { return; }
        channel.send(response);
    }
}

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
    // Load config
    Config.data.clientId = c.user.id;
    Config.save();

    // Update global commands
    if (process.argv.includes('-init')) { App.updateGlobalCommands(); }

    // Update guild list
    App.updateGuilds();
    App.client.on(Events.GuildCreate, guild => { App.updateGuilds(); });
    App.client.on(Events.GuildDelete, guild => { App.updateGuilds(); });

    // Start GUI site
    GuiSite.init();

    if (Config.data.openaiToken !== "") {
        configuration = new Configuration({ apiKey: Config.data.openaiToken });
        openai = new OpenAIApi(configuration);
    }


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
            return;
        }

        if (interaction.isButton()) {
            if (interaction.customId === "openai_chat_usage_policy_agree") {
                let user_index = Config.data.chatWhitelist.findIndex(u => u.id === interaction.user.id);
                if (user_index !== -1) {
                    if (Config.data.chatWhitelist[user_index].signedUsagePolicy === true) { return; }
                    Config.data.chatWhitelist[user_index].signedUsagePolicy = true;
                    Config.save();
                    await interaction.reply({ content: "Thanks for agreeing to follow the OpenAI usage policies! You can now chat with me by sending me a dm or mentioning me at the start of a message.", ephemeral: true });
                }
            }
        }

    });

    App.client.on(Events.MessageCreate, async message => {
        if (message.author.bot) return;
        if (message.channel.type !== ChannelType.DM) {
            if (!message.mentions.has(Config.data.clientId)) { return; }
        }
        let whitelisted_user;

        // if user is not an admin and not whitelisted, return
        if (!Config.data.adminWhitelist.includes(message.author.id)) {
            whitelisted_user = Config.data.chatWhitelist.find(u => u.id === message.author.id);
            if (whitelisted_user === undefined) {
                await respond(message, "You are not whitelisted to use this feature.");
                return;
            }
        }

        // check if user has signed the terms of service
        if (whitelisted_user !== undefined && whitelisted_user.signedUsagePolicy === false) {
            await respond(message, "To chat with me, you must first agree to follow the OpenAI usage policies. Use the `/chat usage_policy` command to agree to follow the usage policies.");
            return;
        }

        // if openai token is not set, return
        if (openai === undefined) {
            await respond(message, "My old man told me not to talk to strangers.. also i can't find an OpenAI token, so i couldn't even if i wanted to. Please contact my owner for more information.");
            return;
        }

        // remove mention from message
        let prompt = message.content.replace(`<@${Config.data.clientId}>`, "").trim();

        // if prompt is empty, return
        if (prompt === "") {
            await respond(message, "What..");
            return;
        }

        // check if prompt contains a violation of the OpenAI Terms of Service
        let moderation = await openai.createModeration({ input: prompt });
        if (moderation.data.results[0].flagged === true ) {
            await respond(message, "This message was flagged as a violation of the OpenAI Terms of Service. Please try again.");
            return;
        }

        // get chat completion from openai
        let response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "assistant", content: Config.data.chatInitMessage},
                {role: "user", content: prompt}
            ]
        });

        // if response is empty, return
        if (response.data.choices[0].message === undefined) {
            await respond(message, "I'm sorry, i couldn't think of anything to say. That or the OpenAI API is down. Please try again later.");
            return;
        }

        // check if response contains a violation of the OpenAI Terms of Service
        moderation = await openai.createModeration({ input: response.data.choices[0].message.content });
        if (moderation.data.results[0].flagged === true ) {
            await respond(message, "This message was flagged as a violation of the OpenAI Terms of Service. Please try again.");
            return;
        }

        // send response
        await respond(message, response.data.choices[0].message.content);
    });

    console.log(`Ready! Logged in as ${c.user.tag}`);
});

App.client.login(Config.data.botToken);