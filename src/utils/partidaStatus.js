const fs = require("fs");
const path = require("path");
const partidasPath = path.join(__dirname, "../data/PartidasOn.js");

function registrarAcao(partida, tipo) {
  // Garante que a estrutura exista
  if (!partida.estatisticas) partida.estatisticas = { totalAcoes: 0, acoesPlayers: 0, acoesNPCs: 0, avisos: [] };

  partida.estatisticas.totalAcoes++;
  if (tipo === "player") partida.estatisticas.acoesPlayers++;
  else if (tipo === "npc") partida.estatisticas.acoesNPCs++;

  const total = partida.estatisticas.totalAcoes;

  // Mensagens de progresso
  const avisos = partida.estatisticas.avisos;
  let mensagem = null;

  if (total >= 25 && !avisos.includes("25")) {
    mensagem = "⚽ A partida está esquentando — **25 ações!** (início promissor)";
    avisos.push("25");
  } else if (total >= 50 && !avisos.includes("50")) {
    mensagem = "🔥 Metade do jogo! **50 ações** já realizadas. A tensão aumenta!";
    avisos.push("50");
  } else if (total >= 75 && !avisos.includes("75")) {
    mensagem = "💥 Final de jogo se aproximando! **75 ações** — os jogadores estão no limite!";
    avisos.push("75");
  } else if (total >= 100 && !avisos.includes("100")) {
    mensagem = "🏁 **100 ações!** A partida chega ao fim em uma explosão de energia!";
    avisos.push("100");
  }

  // Salvar progresso no arquivo
  const partidasOn = require(partidasPath);
  partidasOn[partida.code] = partida;
  fs.writeFileSync(partidasPath, `module.exports = ${JSON.stringify(partidasOn, null, 2)};`);

  return mensagem;
}

module.exports = { registrarAcao };
