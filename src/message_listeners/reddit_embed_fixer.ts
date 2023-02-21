import { Events, Message } from 'discord.js';
import { JSDOM } from 'jsdom';
import * as http from 'http';
import * as https from 'https';
import * as querystring from 'querystring';

async function getVRedditRedirect(vRedditLink: string): Promise<string | undefined> {
    const parsedUrl = new URL(vRedditLink);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
    };
  
    return new Promise<string | undefined>((resolve, reject) => {
        httpModule.get(options, (response) => {
            if (response.headers.location) {
                resolve(response.headers.location);
            } else {
                resolve(undefined);
            }
        }).on('error', (error) => {
            console.error(`Error fetching Reddit link: ${error}`);
            resolve(undefined);
        });
    });
}

async function isCrosspostLink(redditLink: string): Promise<{ link: string, redirect: string } | undefined> {
    const parsedUrl = new URL(redditLink);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
    };
  
    return new Promise<{ link: string, redirect: string } | undefined>((resolve, reject) => {
        httpModule.get(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                const doc = new JSDOM(data).window.document;
                const crosspostIndicator = doc.querySelector("span._2CvcsV7-z1GzaIu5fJbWZn");
                if (crosspostIndicator) {
                    const crosspostLink = doc.querySelector("div[data-test-id='post-content'] a[data-click-id='body']");
                    if (crosspostLink) {
                    resolve({
                        link: redditLink,
                        redirect: (crosspostLink as HTMLAnchorElement).href
                    });
                    } else {
                    resolve(undefined);
                    }
                } else {
                    resolve(undefined);
                }
            });
        }).on('error', (error) => {
            console.error(`Error fetching Reddit link: ${error}`);
            resolve(undefined);
        });
    });
}

async function onMessageCreate(message: Message) {
    const vRedditLinks = message.content.match(/https?:\/\/v\.redd\.it\/[^\s]+/g) || [];
    const redditLinks = message.content.match(/https?:\/\/(www\.)?reddit\.com\/r\/[^\s]+/g) || [];

    console.log(message);

    if (vRedditLinks.length === 0 && redditLinks.length === 0) {
        return;
    }
    
    // remove duplicate links
    const uniquevRedditLinks = [...new Set(vRedditLinks)];
    const uniqueRedditLinks = [...new Set(redditLinks)];

    var linkRedirectMap = new Map<string, string>();

    // get vreddit redirects
    if (uniquevRedditLinks.length > 0) {
        for (let i = 0; i < uniquevRedditLinks.length; i++) {
            const link = uniquevRedditLinks[i];
            const redirect = await getVRedditRedirect(link);
            if (redirect) {
                linkRedirectMap.set(link, redirect);
            }
        }
    }

    // get crosspost redirects
    if (uniqueRedditLinks.length > 0) {
        const promises = uniqueRedditLinks.map((link) => isCrosspostLink(link));
        const results = await Promise.all(promises);
        results.forEach((result) => {
            if (result) {
                linkRedirectMap.set(result.link, result.redirect);
            }
        });
    }

    // log redirects
    if (linkRedirectMap.size > 0) {
        console.log(`Found ${linkRedirectMap.size} Reddit links in message ${message.id}`);
        linkRedirectMap.forEach((value, key) => {
            console.log(`Link: ${key} -> ${value}`);
        });
    }
    
}

export { onMessageCreate };