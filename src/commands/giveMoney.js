const Player = require("../models/player");

module.exports = {
  name: "givemoney",
  description: "Mestre dá dinheiro a um jogador. Uso: !givemoney @player <quantidade>",
  async execute(message, args) {
    // apenas o mestre pode usar
    const mestreId = "465303026400231434"; // 🔹 coloque o ID do mestre
    if (message.author.id !== mestreId) {
      return message.reply("❌ Apenas o mestre pode usar este comando!");
    }

    const alvo = message.mentions.users.first();
    const quantidade = parseInt(args[1]);

    if (!alvo || isNaN(quantidade) || quantidade <= 0) {
      return message.reply("❌ Uso: !givemoney @player <quantidade>");
    }

    const player = await Player.findOne({ discordId: alvo.id });
    if (!player) return message.reply("❌ Jogador não encontrado no banco de dados!");

    player.dinheiroEmMaos += quantidade;
    player.banco.historico.push(`Recebeu ${quantidade} do mestre.`);
    await player.save();

    message.channel.send(`💰 O mestre deu **${quantidade}** para **${player.nome}**.`);
  }
};
