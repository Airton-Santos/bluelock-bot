module.exports = [
  // ARMA 1 - "Tempestade Carmesim"
  {
    nome: "Chute Carmesim",
    descricao: "Um chute envolto em energia vermelha que explode ao contato com a bola.",
    tipo: "chute",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 12
  },
  {
    nome: "Fúria Escarlate",
    descricao: "Aumenta poder de chute e velocidade por 2 turnos.",
    tipo: "buff",
    buff: { chute: 6, velocidade: 5 },
    turnos: 2,
    cooldown: 6,
    custoStamina: 6
  },

  // ARMA 2 - "Serpente de Prata"
  {
    nome: "Drible da Serpente",
    descricao: "Movimentos sinuosos confundem o adversário e criam brechas no campo.",
    tipo: "drible",
    buff: null,
    turnos: 0,
    cooldown: 3,
    custoStamina: 8
  },
  {
    nome: "Reflexo Prateado",
    descricao: "Aumenta agilidade e precisão de drible por 3 turnos.",
    tipo: "buff",
    buff: { agilidade: 6, drible: 5 },
    turnos: 3,
    cooldown: 6,
    custoStamina: 5
  },

  // ARMA 3 - "Raio Dourado"
  {
    nome: "Impacto Relâmpago",
    descricao: "Um chute tão rápido que deixa um rastro dourado no ar.",
    tipo: "chute",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 10
  },
  {
    nome: "Cintilação",
    descricao: "Aumenta velocidade e precisão por 2 turnos.",
    tipo: "buff",
    buff: { velocidade: 7, precisao: 4 },
    turnos: 2,
    cooldown: 5,
    custoStamina: 4
  },

  // ARMA 4 - "Aspectro Azul"
  {
    nome: "Drible Fantasmático",
    descricao: "O jogador desaparece por um instante, reaparecendo com a bola nos pés.",
    tipo: "drible",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 9
  },
  {
    nome: "Sombras Ilusórias",
    descricao: "Aumenta evasão e velocidade de reação por 2 turnos.",
    tipo: "buff",
    buff: { reflexo: 5, agilidade: 6 },
    turnos: 2,
    cooldown: 5,
    custoStamina: 5
  },

  // ARMA 5 - "Titã de Aço"
  {
    nome: "Parede de Ferro",
    descricao: "O jogador bloqueia chutes com força desumana.",
    tipo: "defesa",
    buff: null,
    turnos: 0,
    cooldown: 5,
    custoStamina: 10
  },
  {
    nome: "Corpo de Aço",
    descricao: "Aumenta defesa e equilíbrio por 3 turnos.",
    tipo: "buff",
    buff: { defesa: 7, equilibrio: 6 },
    turnos: 3,
    cooldown: 6,
    custoStamina: 6
  },

  // ARMA 6 - "Caçador Noturno"
  {
    nome: "Roubo Sombrio",
    descricao: "Rouba a bola num piscar de olhos, aproveitando qualquer brecha.",
    tipo: "roubo",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 8
  },
  {
    nome: "Instinto Predador",
    descricao: "Aumenta marcação e reflexos por 2 turnos.",
    tipo: "buff",
    buff: { marcacao: 5, reflexo: 5 },
    turnos: 2,
    cooldown: 5,
    custoStamina: 5
  },

  // ARMA 7 - "Lança Celeste"
  {
    nome: "Chute Celestial",
    descricao: "Um chute elevado e preciso, como uma lança atravessando o céu.",
    tipo: "chute",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 11
  },
  {
    nome: "Aura Divina",
    descricao: "Aumenta precisão e visão de campo por 2 turnos.",
    tipo: "buff",
    buff: { precisao: 6, passe: 5 },
    turnos: 2,
    cooldown: 5,
    custoStamina: 5
  },

  // ARMA 8 - "Inferno Carmim"
  {
    nome: "Explosão Infernal",
    descricao: "Um chute devastador que causa impacto psicológico no goleiro.",
    tipo: "chute",
    buff: null,
    turnos: 0,
    cooldown: 5,
    custoStamina: 13
  },
  {
    nome: "Calor da Batalha",
    descricao: "Aumenta força e resistência física por 2 turnos.",
    tipo: "buff",
    buff: { forca: 6, resistencia: 5 },
    turnos: 2,
    cooldown: 6,
    custoStamina: 6
  },

  // ARMA 9 - "Eco do Vento"
  {
    nome: "Passe Turbulento",
    descricao: "Um passe tão veloz que corta o ar como uma lâmina de vento.",
    tipo: "passe",
    buff: null,
    turnos: 0,
    cooldown: 3,
    custoStamina: 7
  },
  {
    nome: "Brisa Ágil",
    descricao: "Aumenta velocidade e passe por 3 turnos.",
    tipo: "buff",
    buff: { velocidade: 5, passe: 5 },
    turnos: 3,
    cooldown: 6,
    custoStamina: 5
  },

  // ARMA 10 - "Olho do Dragão"
  {
    nome: "Visão Dracônica",
    descricao: "Analisa o campo com precisão sobre-humana, antecipando movimentos.",
    tipo: "passe",
    buff: null,
    turnos: 0,
    cooldown: 4,
    custoStamina: 8
  },
  {
    nome: "Sangue de Dragão",
    descricao: "Aumenta precisão, chute e reflexo por 2 turnos.",
    tipo: "buff",
    buff: { precisao: 5, chute: 5, reflexo: 4 },
    turnos: 2,
    cooldown: 6,
    custoStamina: 6
  }
];
