function atualizarFome(player) {
  const agora = Date.now();
  const ultima = player.ultimaAtualizacaoFome || agora;

  // Diferença em horas
  const horasPassadas = Math.floor((agora - ultima) / (1000 * 60 * 60));

  if (horasPassadas > 0) {
    // Cai 5 pontos de fome por hora
    const perda = horasPassadas * 5;
    player.fome = Math.max(0, player.fome - perda);
    player.ultimaAtualizacaoFome = agora;
  }

  return player.fome;
}

module.exports = { atualizarFome };
