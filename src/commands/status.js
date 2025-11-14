const { EmbedBuilder } = require("discord.js");
const Player = require("../models/player");
const atualizarFome = require("../utils/fome").atualizarFome;

module.exports = {
  name: "status",
  description: "Mostra o status completo do seu jogador.",

  async execute(message) {
    const user = message.author;
    const player = await Player.findOne({ discordId: user.id });

    if (!player) return message.reply("❌ Você não possui um personagem!");

    // Atualiza fome automaticamente
    atualizarFome(player);
    await player.save();

    const { atributos, banco, casa, dividas } = player;

    // 🧠 Embed formatado e dividido em seções
    const embed = new EmbedBuilder()
      .setColor("#00BFFF")
      .setTitle(`📊 Status de ${player.nome}`)
      .setDescription(`**Posição:** ${player.posicao}\n**Idade:** ${player.idade} anos\n**País:** ${player.pais}`)
      .addFields(
        {
          name: "⚙️ Atributos",
          value:
            `**Stamina:** ${atributos.stamina}\n` +
            `**Velocidade:** ${atributos.velocidade}\n` +
            `**Drible:** ${atributos.drible}\n` +
            `**Chute:** ${atributos.chute}\n` +
            `**Passe:** ${atributos.passe}\n` +
            `**Defesa:** ${atributos.defesa}\n` +
            `**Marcação:** ${atributos.marcacao}\n` +
            `**Agilidade:** ${atributos.agilidade}\n` +
            `**Equilíbrio:** ${atributos.equilibrio}\n` +
            `**Reflexo:** ${atributos.reflexo}\n` +
            `**Precisão:** ${atributos.precisao}`,
          inline: true,
        },
        {
          name: "💰 Finanças",
          value:
            `**💵 Dinheiro em mãos:** ${player.dinheiroEmMaos}¥\n` +
            `**🏦 Saldo bancário:** ${banco.saldo}¥\n` +
            `**💳 Crédito usado:** ${banco.credito}/${banco.limiteCredito}¥\n` +
            `**📜 Dívidas:** ${
              dividas.length > 0
                ? dividas.map((d) => `- ${d.descricao}: ${d.valor}¥`).join("\n")
                : "Nenhuma"
            }`,
          inline: true,
        },
        {
          name: "🏠 Casa",
          value:
            `**Tipo:** ${casa.tipo}\n` +
            `**Residência:** ${
              casa.residencia === "alugada" ? "🏚️ Alugada" : "🏡 Própria"
            }`,
          inline: false,
        },
        {
          name: "🍽️ Status Físico",
          value:
            `**Fome:** ${player.fome}/100\n` +
            `**Treinando:** ${player.treinoAtivo ? "✅ Sim" : "❌ Não"}`,
          inline: false,
        }
      )
      .setFooter({
        text: `Número: ${player.numero} • Altura: ${player.altura}cm • Peso: ${player.peso}kg`,
      })
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    await message.channel.send({ embeds: [embed] });
  },
};
