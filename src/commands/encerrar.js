const fs = require('fs');
const path = require('path');
const { matches } = require('../data/matchManager');

module.exports = {
    name: 'encerrar',
    async execute(message, args) {
        const masterId = message.author.id;
        const code = args[0]?.toUpperCase();

        if (!code) return message.channel.send('❌ Use: !encerrar <codigo>');

        const match = matches.get(code);
        if (!match) return message.channel.send('❌ Sala não encontrada!');
        if (match.masterId !== masterId) return message.channel.send('❌ Apenas o mestre da sala pode encerrar a partida!');

        // Remove do Map de partidas
        matches.delete(code);

        // Remove do arquivo partidasOn.js
        const partidasPath = path.join(__dirname, '../data/partidasOn.js');
        let partidasOn = {};
        try {
            partidasOn = require(partidasPath);
        } catch (err) {
            partidasOn = {};
        }

        delete partidasOn[code];

        fs.writeFileSync(
            partidasPath,
            `module.exports = ${JSON.stringify(partidasOn, null, 2)};`
        );

        message.channel.send(`✅ Partida **${code}** encerrada e removida da lista de partidas ativas.`);
    }
};
