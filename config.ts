import * as path from "path";
import * as fs from "fs";

class Guild {
  public id: string;
  public commands: string[];
  constructor(id: string, commands: string[]) {
    this.id = id;
    this.commands = commands;
  }
}

export class Config {
  public static botToken: string = "";
  public static clientId: string = "";
  public static guilds: Guild[] = [];
  public static commandsFolderPath: string = "";
  public static load() {
    this.commandsFolderPath = path.join(__dirname, "commands");
    if (fs.existsSync("./config.json")) {
      const contents = JSON.parse(fs.readFileSync("./config.json", "utf8"));

      let missingRequiredFields = false;

      if (!contents.bot_token || contents.bot_token.length === 0) { missingRequiredFields = true; }
      this.botToken = contents.bot_token;
      if (!contents.client_id || contents.client_id.length === 0) { missingRequiredFields = true; }
      this.clientId = contents.client_id;

      if (missingRequiredFields) {
        console.log("Please fill in bot_token and client_id in config.json and restart the bot.");
        process.exit(1);
      }

      // load guilds
      if (contents.guilds) {
        for (const guild of contents.guilds) {
          if (guild.id && guild.name && guild.commands) {
            this.guilds.push(new Guild(guild.id, guild.commands));
          } else {
            console.log(
              `[WARNING] Guild ${guild.name} is missing id and or commands.`
            );
          }
        }
      }

    } else {
      // create config
      const contents = { bot_token: "", client_id: "", guilds: [] };
      fs.writeFileSync("./config.json", JSON.stringify(contents, null, 4));
      console.log(
        "Generated config.json. Please fill in the bot token and restart the bot."
      );
      process.exit(1);
    }
  }
  public static save() {
    const contents = {
      bot_token: this.botToken,
      client_id: this.clientId,
      guilds: this.guilds,
    };
    fs.writeFileSync("./config.json", JSON.stringify(contents, null, 4));
  }
}
