const { matches } = require('../data/matchManager');
const Player = require('../models/player');

module.exports = {
  name: 'entrar',
  description: 'Entra em uma sala de partida com o código e o time. Uso: !entrar <codigo> <time>',
  async execute(message, args) {
    const discordId = message.author.id;
    const code = args[0]?.toUpperCase();
    const teamChoice = args[1]?.toUpperCase();

    if (!code || !teamChoice)
      return message.channel.send('❌ Use: `!entrar <codigo> <A/B>`');

    if (!['A', 'B'].includes(teamChoice))
      return message.channel.send('❌ Time inválido! Use apenas **A** ou **B**.');

    const match = matches.get(code);
    if (!match) return message.channel.send('❌ Sala não encontrada!');

    // Verifica se o jogador já está na sala
    if (match.players.find(p => p.discordId === discordId)) {
      return message.channel.send('❌ Você já está nessa sala!');
    }

    const player = await Player.findOne({ discordId });
    if (!player) return message.channel.send('❌ Você não está registrado como player!');

    // Verifica se o time está cheio
    const timePlayers = match.players.filter(p => p.time === teamChoice);
    if (timePlayers.length >= 11)
      return message.channel.send(`❌ O time **${teamChoice}** já está cheio! (Máx 11 jogadores)`);

    // Adiciona o jogador ao time escolhido
    const success = match.addPlayer({
      discordId,
      nome: player.nome,
      atributos: player.atributos,
      posicao: player.posicao,
      idade: player.idade,
      altura: player.altura,
      peso: player.peso,
      time: teamChoice
    });

    if (!success) return message.channel.send('❌ Não foi possível adicionar o jogador.');

    message.channel.send(`✅ ${player.nome} entrou na sala **${code}** no time **${teamChoice}**! ⚽`);
  }
};
