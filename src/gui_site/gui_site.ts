import express, { Express } from 'express';
import { Config } from '../config';
import { App } from '../app';

import bodyParser from 'body-parser';
import Helmet from "helmet";

import * as crypto from 'crypto';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

class User {
    ip: string;
    failedAuthAttempts: number;
    unbanTime: Date | null;
    constructor(ip: string) {
        this.ip = ip;
        this.failedAuthAttempts = 1;
        this.unbanTime = null;
    }
}

const TOKEN_LIFE_TIME_MINUTES = 10;
const MAX_FAILED_AUTH_ATTEMPTS = 3;
const BAN_TIME_MINUTES = 10;
const failedAuthUsers:  User[] = [];

function cleanFailedAuthUsers() {
    const now = new Date();
    for (let i = 0; i < failedAuthUsers.length; i++) {
        const unbanTime = failedAuthUsers[i].unbanTime;
        if (unbanTime !== null) {
            if (unbanTime < now) {
                failedAuthUsers.splice(i, 1);
                i--;
            }
        }
    }
}

class Session {
    public token: string | null = null;
    public expiration: Date | null = null;
    public create(): string {
        this.token = crypto.randomBytes(32).toString('hex');
        this.expiration = new Date();
        this.expiration.setMinutes(this.expiration.getMinutes() + TOKEN_LIFE_TIME_MINUTES);
        return this.token;
    }
    public isValid(): boolean {
        if ((this.token === null) || (this.expiration === null)) { return false; }
        if (this.expiration < new Date()) { return false; }
        return true;
    }
}

export class GuiSite {
    public static app: Express;
    public static session: Session;
    public static urlPrefix: string;
    public static init() {
        this.session = new Session();
        this.app = require('express')();
        this.app.use(Helmet());

        const auth = (req: any, res: any, next: any) => {
            cleanFailedAuthUsers();

            // get user from failedAuthUsers
            let user: User | null = null;
            let index = failedAuthUsers.findIndex((user) => user.ip === req.ip);
            if (index !== -1) { 
                user = failedAuthUsers[index]; 
            }

            // check if user is banned
            if (user !== null) {
                if (user.unbanTime !== null) {
                    if (user.unbanTime > new Date()) {
                        res.status(401).send('Unauthorized: Too many failed auth attempts');
                        return;
                    }
                }
            }

            // if session is valid and token matches, move along
            if (this.session.isValid() && (this.session.token === req.params.token)) {
                next();
            } else {
                res.status(401).send('Unauthorized: Invalid or expired session');
                // increment failed auth attempts for user, ban if exceeded max attempts
                if (user !== null) {
                    user.failedAuthAttempts++;
                    if (user.failedAuthAttempts >= MAX_FAILED_AUTH_ATTEMPTS) {
                        user.unbanTime = new Date();
                        user.unbanTime.setMinutes(user.unbanTime.getMinutes() + BAN_TIME_MINUTES);
                    }
                } else {
                    failedAuthUsers.push(new User(req.ip));
                    if (failedAuthUsers.length > 100) {
                        console.error('Too many failed auth attempts. Possible brute force attack, shutting down');
                        process.exit(1);
                    }
                }
            }
        };

        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(bodyParser.json());

        // get settings page
        this.app.get(`${Config.data.guiSite.botRoute}/:token`, auth, (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'settings.html'));
        });

        // get all commands
        this.app.get(`${Config.data.guiSite.botRoute}/commands/:token`, auth, (req, res) => {
            const commands: any = [];
            App.commands.forEach((command) => {
                if (command.isGlobal === true) { return; }
                const cmd = { ...command };
                delete cmd.execute;
                commands.push(cmd);
            });
            res.send(commands);
        });

        // get guilds
        this.app.get(`${Config.data.guiSite.botRoute}/guilds/:token`, auth, (req, res) => {
            const guilds: any = [];
            App.client.guilds.cache.forEach((guild) => {
                guilds.push({ id: guild.id, name: guild.name });
            });
            res.send(guilds);
        });

        // get guild command whitelist
        this.app.get(`${Config.data.guiSite.botRoute}/guild/:guildId/commands/:token`, auth, (req, res) => {
            const index = Config.data.guilds.findIndex((guild) => guild.id === req.params.guildId);
            if (index === -1) {
                res.status(404).send('Guild not found');
                return;
            } else {
                res.send(Config.data.guilds[index].commandWhitelist);
            }
        });

        // set guild commands
        this.app.put(`${Config.data.guiSite.botRoute}/guild/:guildId/commands/:token`, auth, (req, res) => {
            const index = Config.data.guilds.findIndex((guild) => guild.id === req.params.guildId);
            if (index === -1) {
                res.status(404).send('Guild not found');
                return;
            } else {
                Config.data.guilds[index].commandWhitelist = req.body;
                Config.save();
                App.updateGuildCommands(req.params.guildId);
                res.send({ success: true });
            }
        });

        if (Config.data.guiSite.sslKeyPath === '' || Config.data.guiSite.sslCertPath === '') {
            // start http server
            this.urlPrefix = `http://`;
            this.app.listen(Config.data.guiSite.port, () => {
                console.log(`Graphical User Interface website listening on port ${Config.data.guiSite.port}`);
            });
        } else {
            // start https server
            this.urlPrefix = `https://`;
            const server: any = https.createServer({
                key: fs.readFileSync(Config.data.guiSite.sslKeyPath),
                cert: fs.readFileSync(Config.data.guiSite.sslCertPath)
            }, this.app).listen(Config.data.guiSite.port, () => {
                console.log(`Graphical User Interface website listening on port ${Config.data.guiSite.port}`);
            });
        }
    }
}