const fs = require('fs');
const path = require('path');
const { matches } = require('../data/matchManager');

module.exports = {
    name: 'play',
    async execute(message, args) {
        const masterId = message.author.id;
        const code = args[0]?.toUpperCase();

        if (!code) return message.channel.send('❌ Use: !play <codigo>');

        const match = matches.get(code);
        if (!match) return message.channel.send('❌ Sala não encontrada!');
        if (match.masterId !== masterId) return message.channel.send('❌ Apenas o mestre da sala pode iniciar a partida!');
        if (match.started) return message.channel.send('❌ A partida já começou!');

        const allPlayers = match.getAllPlayers();
        const teamA = allPlayers.filter(p => p.time === 'A');
        const teamB = allPlayers.filter(p => p.time === 'B');

        if (teamA.length < 1 || teamB.length < 1) {
            return message.channel.send('❌ Cada time precisa ter pelo menos 1 jogador ou NPC!');
        }

        match.started = true;

        // Salvar partida em arquivo JSON
        const partidasPath = path.join(__dirname, '../data/partidasOn.js');

        let partidasOn = {};
        try {
            partidasOn = require(partidasPath);
        } catch (err) {
            partidasOn = {};
        }

        partidasOn[code] = {
            masterId: match.masterId,
            started: match.started,
            players: allPlayers
        };

        fs.writeFileSync(
            partidasPath,
            `module.exports = ${JSON.stringify(partidasOn, null, 2)};`
        );

        const formatTeam = team => team.map(p => p.nome).join(', ');
        message.channel.send(
            `⚽ Partida iniciada!\n\n` +
            `**Time A:** ${formatTeam(teamA)}\n` +
            `**Time B:** ${formatTeam(teamB)}`
        );
    }
};
