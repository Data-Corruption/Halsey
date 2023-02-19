import * as path from "path";
import * as fs from "fs";

interface GuildInterface {
  id: string;
  commandWhitelist: string[];
  archiveChannelId: string;
  bookmarks: Map<string, string>;
}

interface ConfigInterface {
  botToken: string;
  adminWhitelist: string[];
  guiSite: {
    port: number;
    domain: string;
    botRoute: string;
    sslKeyPath: string;
    sslCertPath: string;
  };
  clientId: string;
  guilds: GuildInterface[];
}

const configPath = path.join(__dirname, "..", "config.json");

export class Config {
  public static data: ConfigInterface;
  public static load() {
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
        adminWhitelist: [],
        guiSite: {
          port: 8443,
          domain: "",
          botRoute: "",
          sslKeyPath: "",
          sslCertPath: ""
        },
        clientId: "",
        guilds: []
      };
      fs.writeFileSync(configPath, JSON.stringify(contents, null, 4));
      console.log(`Generated config.json at ${configPath}. Please fill in the required felids and restart the bot.`);
      process.exit(0);
    }
  }
  public static save() {
    fs.writeFileSync(configPath, JSON.stringify(this.data, null, 4));
  }
}
