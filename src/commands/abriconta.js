const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player"); // seu model do MongoDB

module.exports = {
  name: "abrirconta",
  description: "Abre sua conta bancária no sistema Blue Lock",
  async execute(message, args) {
    try {
      const player = await Player.findOne({ discordId: message.author.id });

      if (!player) {
        return message.reply("❌ Você ainda não tem personagem registrado. Crie um antes com `!criar`.");
      }

      if (player.banco.saldo > 0 || player.banco.historico.length > 0) {
        return message.reply("⚠️ Você já possui uma conta bancária!");
      }

      // Inicializar conta
      player.banco.saldo = 500; // bônus inicial
      player.banco.credito = 0;
      player.banco.limiteCredito = 1000;
      player.banco.historico.push("🏦 Conta aberta com saldo inicial de 500¥");
      await player.save();

      // Embed
      const embed = new EmbedBuilder()
        .setColor("#2ecc71")
        .setTitle("🏦 Conta Bancária Criada!")
        .setDescription(`Parabéns, **${player.nome}**, sua conta foi aberta com sucesso!`)
        .addFields(
          { name: "💰 Saldo inicial", value: "`500¥`", inline: true },
          { name: "💳 Limite de crédito", value: "`1000¥`", inline: true },
          { name: "📜 Histórico", value: "🏦 Conta aberta com saldo inicial de 500¥" }
        )
        .setFooter({ text: "Use !banco para visualizar suas informações." })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await message.reply("❌ Ocorreu um erro ao abrir sua conta bancária.");
    }
  }
};
