import * as path from "path";
import * as fs from "fs";

var version: string = require('../package.json').version;

interface GuildInterface {
  id: string;
  commandWhitelist: string[];
}

interface ConfigInterface {
  version: string;
  botToken: string;
  clientId: string;
  guilds: GuildInterface[];
  adminWhitelist: string[];
  guiSite: {
    port: number;
    domain: string;
    botRoute: string;
    sslKeyPath: string;
    sslCertPath: string;
  };
}

const configPath = path.join(__dirname, "..", "config.json");

export class Config {
  public static data: ConfigInterface;
  public static load() {
    if (fs.existsSync(configPath)) {
      try {
        this.data = require(configPath) as ConfigInterface;
        // if version is not the same, update the config or throw an error
        if (this.data.version !== version) {
          console.error("Config version does not match package.json version and there is no automatic conversion available.");
          process.exit(1);
        }
      } catch (error) {
        console.error(`Error loading config file: ${error}`);
        process.exit(1);
      }
    } else {
      const contents: ConfigInterface = {
        version: version,
        botToken: "",
        clientId: "",
        guilds: [],
        adminWhitelist: [],
        guiSite: {
          port: 8443,
          domain: "",
          botRoute: "",
          sslKeyPath: "",
          sslCertPath: ""
        }
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
