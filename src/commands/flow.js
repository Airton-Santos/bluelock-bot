const fs = require("fs");
const path = require("path");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const Player = require("../models/player");
const fluxos = require("../data/fluxo");

module.exports = {
  name: "flow",
  description: "Ativa ou desativa o modo Flow de um jogador ou NPC. Uso: !flow on @player ou !flow on NomeNPC",
  async execute(message, args) {
    const partidasPath = path.join(__dirname, "../data/PartidasOn.js");
    const sender = message.author;

    if (!args[0] || !["on", "off"].includes(args[0].toLowerCase()))
      return message.reply("⚠️ Use `!flow on <jogador>` ou `!flow off <jogador>`.");

    const modo = args[0].toLowerCase();

    // Nome do jogador ou NPC
    const alvoMen = message.mentions.users.first();
    const nomeNPC = args.slice(1).join(" ");
    const nomeBusca = alvoMen ? alvoMen.username : nomeNPC;

    // carregar partida
    delete require.cache[require.resolve(partidasPath)];
    const partidas = require(partidasPath);
    const partida = Object.values(partidas).find(p => p.started);
    if (!partida) return message.reply("❌ Nenhuma partida ativa no momento.");

    // procurar jogador ou npc
    const alvo = partida.players.find(p =>
      alvoMen ? p.discordId === alvoMen.id : p.nome.toLowerCase() === nomeBusca.toLowerCase()
    );

    if (!alvo) return message.reply("❌ Jogador/NPC não encontrado na partida atual.");

    const isNPC = !alvo.discordId || alvo.discordId.startsWith("NPC_");

    let fluxo;
    if (isNPC) {
      // NPC usa fluxo básico (define direto no arquivo da partida ou padrão)
      fluxo = fluxos.find(f => f.nome.toLowerCase() === (alvo.fluxoAtivo?.toLowerCase() || "Base"));
      if (!fluxo) fluxo = fluxos[0]; // fallback
    } else {
      // Jogador real → busca do banco
      const playerDB = await Player.findOne({ discordId: alvo.discordId });
      if (!playerDB) return message.reply("❌ Esse jogador não possui personagem criado.");
      fluxo = fluxos.find(f => f.nome === playerDB.fluxoAtivo);
      if (!fluxo) return message.reply("⚠️ Esse jogador ainda não possui um fluxo definido.");
    }

    const assetsPath = path.join(__dirname, "../assets");
    const gifPath = path.join(assetsPath, "flow.gif");
    const gifAttachment = new AttachmentBuilder(gifPath, { name: "flow.gif" });

    if (modo === "on") {
      if (alvo.flowAtivo) return message.reply("⚠️ Esse jogador já está em Flow.");

      alvo["flowAtivo"] = true;

      // aplicar bônus (NPC = sempre bônus base)
      for (const [key, value] of Object.entries(fluxo.bonusAtributos)) {
        if (key !== "stamina" && typeof alvo.atributos[key] === "number") {
          alvo.atributos[key] += value;
        }
      }

      const embed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(isNPC ? "💥 FLOW ATIVADO" : `💥 FLOW ATIVADO: ${fluxo.nome}`)
        .setDescription(
          `**${alvo.nome}** entrou em estado de **FLUXO**!\n\n${fluxo.descricao}\n\n🩸 *“Os limites humanos foram quebrados...”*`
        )
        .setImage("attachment://flow.gif")
        .setFooter({ text: `Ativado por ${sender.username}` })
        .setTimestamp();

      await message.channel.send({ embeds: [embed], files: [gifAttachment] });

    } else if (modo === "off") {
      if (!alvo.flowAtivo) return message.reply("⚠️ Esse jogador não está em Flow.");

      for (const [key, value] of Object.entries(fluxo.bonusAtributos)) {
        if (key !== "stamina" && typeof alvo.atributos[key] === "number") {
          alvo.atributos[key] -= value;
        }
      }

      delete alvo.flowAtivo;

      const embed = new EmbedBuilder()
        .setColor("#00bfff")
        .setTitle("💤 FLOW DESATIVADO")
        .setDescription(`**${alvo.nome}** saiu do estado de Flow. 🌙`)
        .setImage("attachment://flow.gif")
        .setFooter({ text: `Desativado por ${sender.username}` })
        .setTimestamp();

      await message.channel.send({ embeds: [embed], files: [gifAttachment] });
    }

        // impedir duplicação estranha do Node
    Object.setPrototypeOf(partidas, Object.prototype);

    // garantir que os players não virem versão "bugada"
    partida.players = partida.players.map(p => ({ ...p }));

    // salvar sem duplicar
    fs.writeFileSync(
      partidasPath,
      `module.exports = ${JSON.stringify(partidas, null, 2)};`,
      "utf-8"
    );
      },
};
