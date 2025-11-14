const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "saldo",
  description: "Mostra o saldo da sua conta bancária",
  async execute(message, args) {
    try {
      const player = await Player.findOne({ discordId: message.author.id });

      if (!player) {
        return message.reply("❌ Você ainda não tem personagem. Crie com `!criar`.");
      }

      if (!player.banco) {
        return message.reply("⚠️ Você ainda não possui uma conta bancária. Abra uma com `!abrirconta`.");
      }

      const embed = new EmbedBuilder()
        .setColor("#3498db")
        .setTitle(`🏦 Banco Blue Lock - ${player.nome}`)
        .addFields(
          { name: "💰 Saldo (débito)", value: `\`${player.banco.saldo}¥\``, inline: true },
          { name: "💳 Crédito usado", value: `\`${player.banco.credito}¥\``, inline: true },
          { name: "📈 Limite de crédito", value: `\`${player.banco.limiteCredito}¥\``, inline: true },
        )
        .setDescription("💡 Use `!transferir @jogador valor` para enviar dinheiro para outro jogador.")
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await message.reply("❌ Ocorreu um erro ao consultar seu saldo.");
    }
  }
};
