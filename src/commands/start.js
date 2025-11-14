const { Match, matches } = require('../data/matchManager');

module.exports = {
    name: 'start',
    async execute(message, args) {
        const masterId = message.author.id;

        const match = new Match(masterId);
        matches.set(match.code, match);

        message.channel.send(
            `✅ Sala criada!\nCódigo: **${match.code}**\nJogadores podem entrar usando: !entrar ${match.code}`
        );
    }
};
