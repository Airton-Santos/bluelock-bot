const habilidades = require("./habilidades");

function getHabilidadePorNome(nome) {
  return habilidades.find(h => h.nome === nome);
}

module.exports = [
  {
    nome: "Tempestade Carmesim",
    habilidades: [
      getHabilidadePorNome("Chute Carmesim"),       // narrativa
      getHabilidadePorNome("Fúria Escarlate")     // buff
    ]
  },
  {
    nome: "Serpente de Prata",
    habilidades: [
      getHabilidadePorNome("Drible da Serpente"),  // narrativa
      getHabilidadePorNome("Reflexo Prateado")    // buff
    ]
  },
  {
    nome: "Raio Dourado",
    habilidades: [
      getHabilidadePorNome("Impacto Relâmpago"),       // narrativa
      getHabilidadePorNome("Cintilação")    // buff
    ]
  },
  {
    nome: "Aspectro Azul",
    habilidades: [
      getHabilidadePorNome("Drible Fantasmático"),  // narrativa
      getHabilidadePorNome("Sombras Ilusórias")   // buff
    ]
  },
  {
    nome: "Titã de Aço",
    habilidades: [
      getHabilidadePorNome("Parede de Ferro"),  // narrativa
      getHabilidadePorNome("Corpo de Aço") // buff
    ]
  },
  {
    nome: "Caçador Noturno",
    habilidades: [
      getHabilidadePorNome("Roubo Sombrio"), // narrativa
      getHabilidadePorNome("Instinto Predador")    // buff
    ]
  },
  {
    nome: "Lança Celeste",
    habilidades: [
      getHabilidadePorNome("Chute Celestial"),  // narrativa
      getHabilidadePorNome("Aura Divina")       // buff
    ]
  },
  {
    nome: "Inferno Carmim",
    habilidades: [
      getHabilidadePorNome("Explosão Infernal"),       // narrativa
      getHabilidadePorNome("Calor da Batalha")        // buff
    ]
  },
  {
    nome: "Eco do Vento",
    habilidades: [
      getHabilidadePorNome("Passe Turbulento"),  // narrativa
      getHabilidadePorNome("Brisa Ágil")        // buff
    ]
  },
  {
    nome: "Olho do Dragão",
    habilidades: [
      getHabilidadePorNome("Visão Dracônica"), // narrativa
      getHabilidadePorNome("Sangue de Dragão")    // buff
    ]
  }
];
