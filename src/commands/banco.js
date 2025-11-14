const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "banco",
  description: "Gerencia sua conta bancária (depositar, sacar, ver saldo e histórico).",

  async execute(message, args) {
    try {
      const player = await Player.findOne({ discordId: message.author.id });
      if (!player) return message.reply("❌ Você ainda não possui um personagem. Crie um com `!criar`.");

      if (!player.banco || player.banco.saldo === undefined)
        return message.reply("⚠️ Você ainda não possui conta bancária. Crie uma com `!abrirconta`.");

      const acao = args[0]?.toLowerCase();
      const valor = parseInt(args[1]);

      // Mostra status bancário se nenhum argumento for dado
      if (!acao) {
        const embed = new EmbedBuilder()
          .setColor("#3498db")
          .setTitle(`🏦 Banco Blue Lock — ${player.nome}`)
          .addFields(
            { name: "💵 Dinheiro em mãos", value: `\`${player.dinheiroEmMaos}¥\``, inline: true },
            { name: "🏧 Saldo bancário", value: `\`${player.banco.saldo}¥\``, inline: true },
            { name: "💳 Limite de crédito", value: `\`${player.banco.limiteCredito}¥\``, inline: true },
          )
          .setFooter({ text: "Use !banco depositar <valor>, !banco sacar <valor> ou !banco historico" })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      // Ver histórico
      if (acao === "historico") {
        const historico = player.banco.historico.slice(-5).reverse(); // últimos 5 movimentos
        const embed = new EmbedBuilder()
          .setColor("#95a5a6")
          .setTitle(`📜 Últimas Transações — ${player.nome}`)
          .setDescription(
            historico.length > 0
              ? historico.map((h, i) => `${i + 1}. ${h}`).join("\n")
              : "Nenhum registro no histórico."
          )
          .setFooter({ text: "Mostrando os 5 últimos registros" })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      // Verifica se é depósito ou saque
      if (!["depositar", "sacar"].includes(acao))
        return message.reply("⚠️ Use: `!banco depositar <valor>`, `!banco sacar <valor>` ou `!banco historico`.");

      if (isNaN(valor) || valor <= 0)
        return message.reply("⚠️ Informe um valor válido. Exemplo: `!banco depositar 100`");

      // Ações de depósito e saque
      let embed;
      if (acao === "depositar") {
        if (player.dinheiroEmMaos < valor)
          return message.reply("❌ Você não tem dinheiro suficiente em mãos para depositar.");

        player.dinheiroEmMaos -= valor;
        player.banco.saldo += valor;
        player.banco.historico.push(`📥 Depositou ${valor}¥ no banco.`);

        embed = new EmbedBuilder()
          .setColor("#2ecc71")
          .setTitle("💰 Depósito Realizado")
          .setDescription(`Você depositou **${valor}¥** em sua conta bancária.`)
          .addFields(
            { name: "🏧 Saldo bancário", value: `\`${player.banco.saldo}¥\``, inline: true },
            { name: "💵 Dinheiro em mãos", value: `\`${player.dinheiroEmMaos}¥\``, inline: true },
          );

      } else if (acao === "sacar") {
        if (player.banco.saldo < valor)
          return message.reply("❌ Saldo bancário insuficiente para sacar esse valor.");

        player.banco.saldo -= valor;
        player.dinheiroEmMaos += valor;
        player.banco.historico.push(`📤 Sacou ${valor}¥ do banco.`);

        embed = new EmbedBuilder()
          .setColor("#f1c40f")
          .setTitle("🏧 Saque Realizado")
          .setDescription(`Você sacou **${valor}¥** de sua conta bancária.`)
          .addFields(
            { name: "🏧 Saldo bancário", value: `\`${player.banco.saldo}¥\``, inline: true },
            { name: "💵 Dinheiro em mãos", value: `\`${player.dinheiroEmMaos}¥\``, inline: true },
          );
      }

      await player.save();
      await message.reply({ embeds: [embed.setTimestamp()] });

    } catch (err) {
      console.error(err);
      message.reply("❌ Ocorreu um erro ao acessar o banco.");
    }
  },
};
