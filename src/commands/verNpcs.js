const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const npcs = require("../data/npcs");

const posicoes = ["Atacante", "Meia", "Zagueiro", "Ala", "Goleiro"];

module.exports = {
  name: "npcsver",
  description: "Mostra os nomes dos NPCs por posição com botões.",
  async execute(message) {

    // Cria botões para cada posição
    const row = new ActionRowBuilder();
    posicoes.forEach(pos => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`pos_${pos}`)
          .setLabel(pos)
          .setStyle(ButtonStyle.Primary)
      );
    });

    // Embed inicial
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle("⚽ NPCs por Posição")
      .setDescription("Clique em um botão abaixo para ver os nomes dos NPCs daquela posição.")
      .setTimestamp();

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    // Collector de botões
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000 // 60 segundos
    });

    collector.on("collect", async interaction => {
      // Checa se quem clicou é o mesmo que enviou o comando
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "❌ Apenas quem usou o comando pode clicar.", ephemeral: true });
      }

      const posicao = interaction.customId.replace("pos_", "");
      const npcsFiltrados = npcs.filter(n => n.posicao === posicao);

      if (npcsFiltrados.length === 0) {
        return interaction.reply({ content: `❌ Nenhum NPC encontrado na posição **${posicao}**.`, ephemeral: true });
      }

      const embedNPCs = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle(`🏅 NPCs - ${posicao}`)
        .setDescription(npcsFiltrados.map(n => `• ${n.nome}`).join("\n"))
        .setFooter({ text: `Total: ${npcsFiltrados.length}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embedNPCs], ephemeral: true });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
