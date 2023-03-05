import * as path from "path";
import * as fs from "fs";

interface BookmarkInterface {
  name: string;
  url: string;
}

interface chatUserInterface {
  id: string;
  signedUsagePolicy: boolean;
}

interface GuildInterface {
  id: string;
  commandWhitelist: string[];
  archiveChannelId: string;
  bookmarks: BookmarkInterface[];
}

interface ConfigInterface {
  botToken: string;
  openaiToken: string;
  adminWhitelist: string[];
  guiSite: {
    port: number;
    domain: string;
    botRoute: string;
    sslKeyPath: string;
    sslCertPath: string;
  };
  clientId: string;
  chatInitMessage: string;
  chatWhitelist: chatUserInterface[];
  guilds: GuildInterface[];
}

const configPath = path.join(__dirname, "..", "config.json");

export class Config {
  public static data: ConfigInterface;
  public static load() {
    // if config file exists, load it. Otherwise generate a new one
    if (fs.existsSync(configPath)) {
      try {
        this.data = require(configPath) as ConfigInterface;
      } catch (error) {
        console.error(`Error loading config file: ${error}`);
        process.exit(1);
      }
    } else {
      const contents: ConfigInterface = {
        botToken: "",
        openaiToken: "",
        adminWhitelist: [],
        guiSite: {
          port: 8443,
          domain: "",
          botRoute: "",
          sslKeyPath: "",
          sslCertPath: ""
        },
        clientId: "",
        chatInitMessage: "",
        chatWhitelist: [],
        guilds: []
      };
      fs.writeFileSync(configPath, JSON.stringify(contents, null, 4));
      console.log(`Generated config.json at ${configPath}. Please fill in the required felids and restart the bot.`);
      process.exit(0);
    }
  }
  public static save() {
    // if missing fields, add them
    if (this.data.botToken === undefined) { this.data.botToken = ""; }
    if (this.data.openaiToken === undefined) { this.data.openaiToken = ""; }
    if (this.data.adminWhitelist === undefined) { this.data.adminWhitelist = []; }
    if (this.data.guiSite === undefined) {
      this.data.guiSite = {
        port: 8443,
        domain: "",
        botRoute: "",
        sslKeyPath: "",
        sslCertPath: ""
      };
    }
    if (this.data.clientId === undefined) { this.data.clientId = ""; }
    if (this.data.chatInitMessage === undefined) { this.data.chatInitMessage = ""; }
    if (this.data.chatWhitelist === undefined) { this.data.chatWhitelist = []; }
    if (this.data.guilds === undefined) { this.data.guilds = []; }
    // save
    fs.writeFileSync(configPath, JSON.stringify(this.data, null, 4));
  }
}
