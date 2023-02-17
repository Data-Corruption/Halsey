# Halsey &middot; ![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg) ![npm](https://img.shields.io/npm/v/halsey-bot) ![Build Status](https://img.shields.io/github/actions/workflow/status/Data-Corruption/Halsey/main.yml) 

Halsey is a simple Discord bot with a web gui settings page.

<p>
  <a href="#functionality">Functionality</a> |
  <a href="#getting-started">Getting Started</a> |
  <a href="#developer-guide">Developer Guide</a>
</p>

## Functionality
* Need more than the 50 pin limit? archive messages in a dedicated channel you set!
* Offers to expanded reddit links that have not expanded properly (eg v.redd.it and crossposts)
* Bookmark links for you and your friends.
* Create polls
* and more

## Installation
```
npm i halsey-bot
```
**IMPORTANT** requires [Node.js](https://nodejs.org/) version 16.9.0 or higher

## Filling Out The Config

After installing the bot run it once to generate the `config.json`. You can run the bot by using the following command
```
node ./node_modules/halsey-bot/bin/halsey-bot.js
```

<table>
    <thead>
        <tr>
            <th>Field</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
          <td>botToken</td>
          <td>Before you use the bot it needs an account to control, you create one at the <a href="https://discord.com/developers/applications">Discord Developer Portal</a>. In that process it gives you a token, place that token here. After creating the bot account you can invite it to your server(s) by going to the developer portal and under OAuth2 check the bot, applications.commands, and administrator boxes then use the link it gives you.</td>
        </tr>
        <tr>
          <td>adminWhitelist</td>
          <td>This is a list of user ids that you grant the ability to enable / disable commands on server(s) and other admin privileges. To get user ids enable developer mode on discord in your settings then right click a user and click "copy id"</td>
        </tr>
        <tr>
          <td>port</td>
          <td>This is the port the bot will host the web gui on, it defaults to 8443 and you need to <a href="https://www.noip.com/support/knowledgebase/general-port-forwarding-guide/">forward it</a>.</td>
        </tr>
        <tr>
          <td>domain</td>
          <td>This is the ip or domain pointing to the ip of the computer hosting the bot eg, "www.example.com"</td>
        </tr>
        <tr>
          <td>botRoute</td>
          <td>Optional route to place all the web gui stuff under. eg, "/halsey"</td>
        </tr>
        <tr>
          <td>sslKeyPath</td>
          <td rowspan=2>Optional but recommended ssl cert paths. To generate these you must own a domain with an a record pointing to the server with the bot and then follow <a href="https://certbot.eff.org/instructions">this guide</a>. (set the first dropdown to other)</td>
        </tr>
        <tr>
          <td>sslCertPath</td>
        </tr>
    </tbody>
</table>

**IMPORTANT** All other fields are set and managed by the bot and can safely be ignored.

## Enabling Commands

To enable commands for the bot, you will first need to run the bot with the -init argument `node ./node_modules/halsey-bot/bin/halsey-bot.js -init`. This will enable/update all global commands. You can update global commands at anytime by running the bot with the -init argument again.

To enable/update guild(server only) commands, you can use the `/settings` command. This will generate a link to a web GUI where you can enable/update commands at will.

## Final Notes

I recommend using a program like [pm2](https://pm2.keymetrics.io/) to run and manage the bot process.

## Developer Guide

wip.