import * as path from "path";
import * as fs from "fs";

interface GuildInterface {
  id: string;
  commandWhitelist: string[];
}

interface ConfigInterface {
  botToken: string;
  clientId: string;
  guilds: GuildInterface[];
  guiSite: {
    port: number;
    domain: string;
    botRoute: string;
    sslKeyPath: string;
    sslCertPath: string;
    adminWhitelist: string[];
  };
}

const configPath = path.join(__dirname, "config.json");

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
        clientId: "",
        guilds: [],
        guiSite: {
          port: 8443,
          domain: "",
          botRoute: "",
          sslKeyPath: "",
          sslCertPath: "",
          adminWhitelist: []
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(contents, null, 4));
      console.log("Generated config.json. Please fill in the required felids and restart the bot.");
      process.exit(1);
    }
  }
  public static save() {
    fs.writeFileSync(configPath, JSON.stringify(this.data, null, 4));
  }
}
