const { EmbedBuilder } = require("discord.js");
const path = require("path");
const partidasPath = path.join(__dirname, "../data/PartidasOn.js");

module.exports = {
  name: "statuspartida",
  description: "Mostra o progresso de uma partida",
  async execute(message, args) {
    const mestreId = "465303026400231434";
    if (message.author.id !== mestreId)
      return message.reply("❌ Apenas o mestre pode usar este comando.");

    const codigo = args[0];
    if (!codigo) return message.reply("❌ Use: !statuspartida <codigo>");

    delete require.cache[require.resolve(partidasPath)];
    const partidas = require(partidasPath);
    const partida = partidas[codigo];
    if (!partida) return message.reply("❌ Partida não encontrada.");

    const stats = partida.estatisticas || { totalAcoes: 0, acoesPlayers: 0, acoesNPCs: 0 };
    const progresso = Math.min((stats.totalAcoes / 100) * 100, 100);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Status da Partida ${codigo}`)
      .addFields(
        { name: "Ações totais", value: `${stats.totalAcoes}`, inline: true },
        { name: "Ações de jogadores", value: `${stats.acoesPlayers}`, inline: true },
        { name: "Ações de NPCs", value: `${stats.acoesNPCs}`, inline: true },
        { name: "Progresso estimado", value: `${progresso.toFixed(1)}%` }
      )
      .setColor("#3498db")
      .setFooter({ text: "Blue Lock RPG — Sistema de Partidas" });

    message.channel.send({ embeds: [embed] });
  }
};
