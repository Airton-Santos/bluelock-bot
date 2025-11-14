const Player = require("../models/player");

module.exports = {
  name: "pagar",
  description: "Transfere dinheiro entre jogadores. Uso: !pagar @player <quantidade>",
  async execute(message, args) {
    const pagador = await Player.findOne({ discordId: message.author.id });
    if (!pagador) return message.reply("❌ Você não está registrado como jogador!");

    const alvo = message.mentions.users.first();
    const quantidade = parseInt(args[1]);

    if (!alvo || isNaN(quantidade) || quantidade <= 0) {
      return message.reply("❌ Uso: !pagar @player <quantidade>");
    }

    if (alvo.id === message.author.id) {
      return message.reply("❌ Você não pode pagar a si mesmo!");
    }

    const recebedor = await Player.findOne({ discordId: alvo.id });
    if (!recebedor) return message.reply("❌ Jogador alvo não encontrado!");

    if (pagador.dinheiroEmMaos < quantidade) {
      return message.reply("💸 Você não tem dinheiro suficiente!");
    }

    // transfere
    pagador.dinheiroEmMaos -= quantidade;
    recebedor.dinheiroEmMaos += quantidade;

    // registra no histórico
    pagador.banco.historico.push(`Pagou ${quantidade} para ${recebedor.nome}.`);
    recebedor.banco.historico.push(`Recebeu ${quantidade} de ${pagador.nome}.`);

    await pagador.save();
    await recebedor.save();

    message.channel.send(`✅ **${pagador.nome}** pagou **${quantidade}** para **${recebedor.nome}**!`);
  }
};
