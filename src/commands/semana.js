const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");
const casas = require("../data/casas");

module.exports = {
  name: "semana",
  description: "Aplica as despesas semanais do player (aluguel, luz, água, etc)",
  async execute(message, args) {
    const user = message.author;
    const player = await Player.findOne({ discordId: user.id });

    if (!player) return message.reply("❌ Você não possui um personagem!");

    const embed = new EmbedBuilder()
      .setTitle("💸 Despesas Semanais")
      .setColor("Blue");

    // ⚠️ Verifica se o player já está na rua
    if (player.casa.residencia === "rua") {
      embed.setDescription("🏚️ Você está morando na **rua**. Não há aluguel, água ou luz para pagar, mas viver aqui é difícil...");
      return message.channel.send({ embeds: [embed] });
    }

    // ⚠️ Verifica se o player está falido (saldo negativo + sem dinheiro em mãos)
    if (player.banco.saldo <= 0 && player.dinheiroEmMaos <= 0) {
      player.casa.residencia = "rua";
      player.casa.tipo = "nenhuma";
      await player.save();

      embed.setDescription("💥 Você não conseguiu pagar suas contas e foi **despejado**! Agora vive na **rua**. 🏚️\n\nSem aluguel, luz ou água, mas enfrentará grandes dificuldades daqui em diante.");
      return message.channel.send({ embeds: [embed] });
    }

    // 🏠 Caso contrário, aplica despesas normalmente
    const tipoCasa = player.casa.tipo || "normal";
    const casaInfo = casas[tipoCasa];

    if (player.casa.residencia === "alugada") {
      player.dividas.push({ descricao: `Aluguel da casa (${tipoCasa})`, valor: casaInfo.aluguel });
      embed.addFields({ name: "Aluguel", value: `Você deve pagar ${casaInfo.aluguel}Y esta semana.` });
    } else {
      embed.addFields({ name: "Aluguel", value: "Você possui casa própria, sem aluguel esta semana." });
    }

    player.dividas.push({ descricao: `Conta de luz (${tipoCasa})`, valor: casaInfo.luz });
    player.dividas.push({ descricao: `Conta de água (${tipoCasa})`, valor: casaInfo.agua });

    embed.addFields(
      { name: "Luz", value: `Você deve pagar ${casaInfo.luz}Y esta semana.` },
      { name: "Água", value: `Você deve pagar ${casaInfo.agua}Y esta semana.` }
    );

    await player.save();
    message.channel.send({ embeds: [embed] });
  }
};
