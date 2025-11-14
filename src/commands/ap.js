const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { registrarAcao } = require("../utils/partidaStatus");

const partidasPath = path.join(__dirname, '../data/partidasOn.js');

module.exports = {
  name: 'ap',
  description: 'Executa uma ação de NPC',
  async execute(message, args) {
    const npcNome = args[0]?.toLowerCase();
    const acao = args[1]?.toLowerCase();
    const alvoNome = args[2]?.toLowerCase();

    if (!npcNome || !acao) return message.reply('❌ Use: !ap <npc> <ação> [alvo]');

    // Carrega partidas atualizadas
    delete require.cache[require.resolve(partidasPath)];
    let partidasOn = require(partidasPath);

    const partidaCode = Object.keys(partidasOn)[0];
    const partida = partidasOn[partidaCode];
    if (!partida) return message.reply('❌ Nenhuma partida ativa!');

    // NPCs: players sem discordId
    const npc = partida.players.find(p => !p.discordId && p.nome.toLowerCase() === npcNome);
    if (!npc) return message.reply('❌ NPC não encontrado!');

    if (!npc.atributos) npc.atributos = {};
    if (npc.atributos.stamina == null) npc.atributos.stamina = 100;
    if (npc.atributos.stamina <= 0) return message.reply('❌ Este NPC não tem stamina para fazer a ação!');

    let msg = '';
    const dado = Math.floor(Math.random() * 20) + 1; // 1d20
    let alvo = null;

    if (alvoNome) {
      alvo = partida.players.find(p => p.nome.toLowerCase() === alvoNome);
      if (!alvo) return message.reply('❌ Alvo não encontrado!');
      if (!alvo.atributos) alvo.atributos = {};
      if (alvo.atributos.stamina == null) alvo.atributos.stamina = 100;
    }

    // Define atributo usado e stamina gasta
    let atributoUsado = 0;
    let staminaGasta = 0;

    switch (acao) {
      case 'passar':
        atributoUsado = npc.atributos.passe || 0;
        staminaGasta = 5;
        break;
      case 'chutar':
      case 'chutarlonge':
        atributoUsado = (npc.atributos.chute || 0) + (npc.atributos.precisao || 0);
        staminaGasta = 10;
        break;
      case 'driblar':
        atributoUsado = (npc.atributos.drible || 0) + (npc.atributos.agilidade || 0);
        staminaGasta = 8;
        break;
      case 'esperar':
        atributoUsado = 0;
        staminaGasta = 1;
        break;
      case 'marcar':
        atributoUsado = (npc.atributos.marcacao || 0) + (npc.atributos.forca || 0);
        staminaGasta = 7;
        break;
      case 'desarme':
        atributoUsado = (npc.atributos.forca || 0) + (npc.atributos.marcacao || 0);
        staminaGasta = 8;
        break;
      case 'mover':
        atributoUsado = npc.atributos.velocidade || 0;
        staminaGasta = 5;
        break;
      case 'defender':
        atributoUsado = (npc.atributos.reflexo || 0) + (npc.atributos.defesa || 0);
        staminaGasta = 10;
        break;
      case 'descansar':
        npc.atributos.stamina += 20;
        if (npc.atributos.stamina > 100) npc.atributos.stamina = 100;
        msg = `${npc.nome} descansou e recuperou stamina.`;
        break;
      default:
        return message.reply('❌ Ação inválida!');
    }

    if (acao !== 'descansar') {
      npc.atributos.stamina -= staminaGasta;
      if (npc.atributos.stamina < 0) npc.atributos.stamina = 0;

      const resultado = dado + atributoUsado;
      msg = `${npc.nome} realizou a ação ${acao}. Dado (1d20): ${dado} + Atributo: ${atributoUsado} = **${resultado}**`;
    }


    // ✅ Integra contador de ações antes de salvar
    const aviso = registrarAcao(partida, "npc");
    if (aviso) message.channel.send(aviso);

    // Salva alterações
    fs.writeFileSync(partidasPath, `module.exports = ${JSON.stringify(partidasOn, null, 2)};`);

    const embed = new EmbedBuilder()
      .setTitle('🎮 Ação do NPC')
      .addFields(
        { name: 'NPC', value: npc.nome, inline: true },
        { name: 'Ação', value: acao, inline: true },
        { name: 'Resultado', value: msg },
        { name: 'Stamina', value: `${npc.atributos.stamina}`, inline: true }
      )
      .setColor('#FF9900');

    message.channel.send({ embeds: [embed] });
  }
};
