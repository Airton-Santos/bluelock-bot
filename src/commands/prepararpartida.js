const { matches } = require('../data/matchManager');
const npcs = require('../data/npcs');

module.exports = {
    name: 'prepararpartida',
    async execute(message, args) {
        const masterId = message.author.id;
        const code = args[0]?.toUpperCase();

        if (!code) return message.channel.send('❌ Use: !prepararpartida <codigo>');

        const match = matches.get(code);
        if (!match) return message.channel.send('❌ Sala não encontrada!');
        if (match.masterId !== masterId) return message.channel.send('❌ Apenas o mestre da sala pode adicionar NPCs!');
        if (npcs.length === 0) return message.channel.send('❌ Nenhum NPC disponível. Crie NPCs com !npc criar <nome> <posicao>');

        const npcList = npcs.map(n => n.nome).join(', ');
        await message.channel.send(`NPCs disponíveis: ${npcList}\nQuantos NPCs você quer adicionar ao time B?`);

        const filter = m => m.author.id === masterId;
        const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

        collector.on('collect', async m => {
            const quantidade = parseInt(m.content);
            if (isNaN(quantidade) || quantidade < 1) return message.channel.send('❌ Valor inválido.');

            await message.channel.send(`Digite os nomes dos ${quantidade} NPCs que deseja adicionar ao time B, separados por vírgula:`);

            const collectorNpcsB = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });
            collectorNpcsB.on('collect', m2 => {
                const chosen = m2.content.split(',').map(n => n.trim());
                const added = [];

                chosen.slice(0, quantidade).forEach(name => {
                    const npc = npcs.find(n => n.nome.toLowerCase() === name.toLowerCase());
                    if (npc) {
                        match.addNPC(npc, 'B');
                        added.push(npc.nome);
                    }
                });

                message.channel.send(`✅ NPCs adicionados ao time B: ${added.join(', ')}`);

                // Pergunta se quer adicionar NPCs ao time dos players
                message.channel.send('Deseja adicionar NPCs ao time dos players? (sim/não)');
                const collectorAddA = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });
                collectorAddA.on('collect', m3 => {
                    if (m3.content.toLowerCase() === 'sim') {
                        message.channel.send('Digite os nomes dos NPCs que deseja adicionar ao time A, separados por vírgula:');
                        const collectorNpcsA = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });
                        collectorNpcsA.on('collect', m4 => {
                            const chosenA = m4.content.split(',').map(n => n.trim());
                            const addedA = [];
                            chosenA.forEach(name => {
                                const npc = npcs.find(n => n.nome.toLowerCase() === name.toLowerCase());
                                if (npc) {
                                    match.addNPC(npc, 'A');
                                    addedA.push(npc.nome);
                                }
                            });
                            message.channel.send(`✅ NPCs adicionados ao time A: ${addedA.join(', ')}`);
                        });
                    } else {
                        message.channel.send('✅ Preparação de NPCs concluída.');
                    }
                });
            });
        });
    }
};
