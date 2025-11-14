const fs = require("fs");
const path = require("path");

const partidasPath = path.join(__dirname, "../data/partidasOn.js");
let partidas = require(partidasPath);
const habilidades = require("../data/habilidades.js");

module.exports = {
  name: "buff",
  description: "Ativa ou desativa um buff em um jogador da partida ativa.",
  async execute(message, args) {
    const masterId = message.author.id;
    const partidaAtiva = Object.values(partidas).find(
      (p) => p.masterId === masterId && p.started
    );

    if (!partidaAtiva)
      return message.reply("❌ Nenhuma partida ativa foi encontrada.");

    const nomeBuff = args.slice(0, -2).join(" ") || args[0]; // suporta nomes compostos
    const playerMention = message.mentions.users.first();
    const acao = args[args.length - 1]?.toLowerCase();

    if (!nomeBuff || !playerMention || !["on", "off"].includes(acao))
      return message.reply(
        "⚙️ Use o formato correto: `!buff <nomeBuff> @jogador on/off`"
      );

    const player = partidaAtiva.players.find(
      (p) => p.discordId === playerMention.id
    );
    if (!player)
      return message.reply("❌ Jogador não encontrado na partida atual.");

    // 🧩 Localiza o buff no arquivo habilidades.js
    const buff = habilidades.find(
      (h) =>
        h.tipo === "buff" &&
        h.nome.toLowerCase() === nomeBuff.toLowerCase()
    );

    if (!buff)
      return message.reply(`❌ Buff "${nomeBuff}" não foi encontrado em habilidades.js.`);

    // --- Ativar Buff ---
    if (acao === "on") {
      if (player._buffsAtivos?.some(b => b.nome === buff.nome))
        return message.reply(`⚠️ O buff **${buff.nome}** já está ativo nesse jogador.`);

      if (!player._atributosOriginais)
        player._atributosOriginais = { ...player.atributos };

      // aplica bônus de cada atributo listado no buff
      for (const [atributo, bonus] of Object.entries(buff.buff)) {
        player.atributos[atributo] =
          (player.atributos[atributo] || 0) + bonus;
      }

      if (!player._buffsAtivos) player._buffsAtivos = [];
      player._buffsAtivos.push({
        nome: buff.nome,
        turnos: buff.turnos
      });

      message.reply(
        `✅ Buff **${buff.nome}** ativado em **${player.nome}** (${Object.entries(buff.buff)
          .map(([a, v]) => `+${v} ${a}`)
          .join(", ")}) por ${buff.turnos} turnos!`
      );
    }

    // --- Desativar Buff ---
    else if (acao === "off") {
      if (!player._buffsAtivos?.some(b => b.nome === buff.nome))
        return message.reply(`⚠️ O buff **${buff.nome}** não está ativo em **${player.nome}**.`);

      for (const [atributo, bonus] of Object.entries(buff.buff)) {
        player.atributos[atributo] =
          (player.atributos[atributo] || 0) - bonus;
      }

      player._buffsAtivos = player._buffsAtivos.filter(b => b.nome !== buff.nome);

      message.reply(`❎ Buff **${buff.nome}** removido de **${player.nome}**.`);
    }

    // 🔥 Salva o arquivo atualizado
    fs.writeFileSync(
      partidasPath,
      "module.exports = " + JSON.stringify(partidas, null, 2)
    );
  },
};
