const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");

module.exports = {
  name: "transferir",
  description: "Transfere dinheiro para outro jogador",
  async execute(message, args) {
    try {
      const sender = await Player.findOne({ discordId: message.author.id });
      if (!sender) return message.reply("❌ Você não possui personagem. Crie com `!criar`.");
      if (!sender.banco) return message.reply("⚠️ Você ainda não possui conta bancária. Abra uma com `!abrirconta`.");

      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply("⚠️ Você precisa mencionar um jogador para transferir.");
      if (targetUser.id === message.author.id) return message.reply("❌ Você não pode transferir para si mesmo!");

      const target = await Player.findOne({ discordId: targetUser.id });
      if (!target) return message.reply("❌ Esse jogador não possui personagem.");
      if (!target.banco) return message.reply("⚠️ Esse jogador ainda não possui conta bancária.");

      const valor = parseInt(args[1]);
      if (isNaN(valor) || valor <= 0) {
        return message.reply("⚠️ Informe um valor válido para transferir. Exemplo: `!transferir @jogador 100`");
      }

      if (sender.banco.saldo < valor) {
        return message.reply("❌ Saldo insuficiente para essa transferência.");
      }

      // Atualizar saldos
      sender.banco.saldo -= valor;
      target.banco.saldo += valor;

      // Registrar histórico
      sender.banco.historico.push(`📤 Transferiu ${valor}¥ para ${target.nome}`);
      target.banco.historico.push(`📥 Recebeu ${valor}¥ de ${sender.nome}`);

      await sender.save();
      await target.save();

      // Embed de confirmação
      const embed = new EmbedBuilder()
        .setColor("#2ecc71")
        .setTitle("💸 Transferência Concluída")
        .addFields(
          { name: "👤 Remetente", value: `${sender.nome}`, inline: true },
          { name: "👤 Destinatário", value: `${target.nome}`, inline: true },
          { name: "💰 Valor", value: `\`${valor}¥\``, inline: true },
        )
        .setFooter({ text: "Banco Blue Lock" })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await message.reply("❌ Ocorreu um erro ao realizar a transferência.");
    }
  }
};
