function extractWordsAndEmoji(text) {
    // Define a regular expression that matches words and emoji
    const regex = /(\w+|:\w+:)/g;
    // Match the regular expression against the input text
    const matches = text.match(regex);
    // Remove the colons from the matched emoji strings
    const emojiMatches = matches?.filter((match) => match.startsWith(':') && match.endsWith(':')).map((match) => match.slice(1, -1));
    // Combine the word and emoji matches and return the result
    return (matches?.filter((match) => !match.startsWith(':') || !match.endsWith(':')) || []).concat(emojiMatches || []);
}

/** Returns a score between -5 and 5, where -5 is very negative and 5 is very positive. Supports Emojis */
async function sentiment(text) {
    const { polarity } = await import('polarity');
    const words = extractWordsAndEmoji(text);
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase();
    }
    var score = polarity(words).polarity;
    // Divide the score by the number of words to get a score per word
    score = score / words.length;
    // scale it to fit -5 to 5
    score = score * 5;
    // round it to the nearest integer, upper if positive, lower if negative, clamp to -5 and 5
    return Math.max(Math.min(Math.round(score), 5), -5);
}

module.exports = sentiment;