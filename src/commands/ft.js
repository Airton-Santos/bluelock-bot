const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const npcs = require("../data/npcs");

module.exports = {
  name: "ftimes",
  description: "Forma 26 times automaticamente com NPCs e pontuação aleatória.",

  async execute(message) {
    try {
      // Agrupar NPCs por posição
      const posicoes = ["Goleiro", "Zagueiro", "Ala", "Meia", "Atacante"];
      const npcsPorPosicao = {};

      for (const pos of posicoes) {
        npcsPorPosicao[pos] = npcs.filter(n => n.posicao === pos);
      }

      const times = {};
      const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

      for (const letra of letras) {
        const time = {
          nome: `Time ${letra}`,
          jogadores: [],
          pontuacao: Math.floor(Math.random() * 20) + 1, // 1–20 aleatório
        };

        for (const pos of posicoes) {
          const disponiveis = npcsPorPosicao[pos];
          if (disponiveis && disponiveis.length > 0) {
            const indexAleatorio = Math.floor(Math.random() * disponiveis.length);
            const escolhido = disponiveis.splice(indexAleatorio, 1)[0];
            time.jogadores.push(escolhido);
          }
        }

        // Verifica se faltou alguém
        if (time.jogadores.length < 5) {
          const faltando = posicoes
            .filter(p => !time.jogadores.some(j => j.posicao === p))
            .join(", ");
          console.log(`⚠️ Time ${letra} está faltando: ${faltando}`);
        }

        times[letra] = time;
      }

      // Salvar arquivo
      const timesPath = path.join(__dirname, "../data/times.json");
      fs.writeFileSync(timesPath, JSON.stringify(times, null, 2));

      // Embed de sucesso
      const embed = new EmbedBuilder()
        .setColor("#00BFFF")
        .setTitle("⚽ Times Formados com Sucesso!")
        .setDescription("Foram criados **26 times (A–Z)** com até 5 jogadores de posições diferentes e pontuação aleatória (1–20).")
        .setFooter({ text: "Use !ranks para ver o ranking dos times." })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await message.reply("❌ Ocorreu um erro ao formar os times.");
    }
  },
};
