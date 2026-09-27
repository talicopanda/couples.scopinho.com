export const strings = {
  en: {
    appTitle: "The Game Box",
    tagline: "How well do you actually know each other?",
    start: "Start game",
    namesTitle: "Who's playing?",
    player1: "Player 1",
    player2: "Player 2",
    continue: "Continue",
    chooseTitle: "Pick a game",
    betName: "Bet You Think I'll Say…",
    betDesc: "One answers. The other predicts.",
    courtName: "Couples Court",
    courtDesc: "Guilty or not guilty?",
    comingSoon: "Coming soon",
    categoriesTitle: "What kind of questions?",
    play: "Play",
    loading: "Loading…",
    loadError: "Couldn't load the game. Check your connection and try again.",
    back: "Back",
    roundN: "Round {n}",
    passTo: "Pass to {name}",
    imName: "I'm {name}",
    betIntro: "{name} answers for themselves. {other} predicts.",
    answerPrivately: "{name}, answer privately",
    betHandoffPredictor: "{name}, time to predict what {other} said.",
    answerYourself: "Answer for yourself",
    predictAnswer: "Predict {name}'s answer",
    answerPlaceholder: "Type your answer…",
    lockIn: "Lock it in",
    placeDown: "Put the phone where you both can see",
    reveal: "Reveal",
    said: "{name} said",
    predicted: "{name} predicted",
    nextRound: "Next round",
    menu: "Menu",
    close: "Close",
    changeCategories: "Change categories",
    switchGame: "Switch game",
    newGame: "New game",
    exhaustedTitle: "You've played every card!",
    reshuffle: "Reshuffle",
    caseN: "Case #{n}",
    votePrivately: "{name}, vote privately",
    courtHandoffSecond: "{name}, time to cast your verdict.",
    courtRevoteHandoff: "Second vote. {name} goes first.",
    yourVerdict: "Your verdict",
    guilty: "Guilty",
    notGuilty: "Not guilty",
    bothGuilty: "Both found them guilty",
    bothNotGuilty: "Both found them not guilty",
    disagreement: "Disagreement",
    courtInSession: "Court is now in session",
    nextPrompt: "Next",
    skipDebate: "Skip to verdict",
    finalQuestion: "Final question",
    positionChanged: "Has your position changed?",
    revote: "Vote again",
    nextCase: "Next case",
  },
  pt: {
    appTitle: "Caixa de Jogos",
    tagline: "Vocês se conhecem mesmo?",
    start: "Começar",
    namesTitle: "Quem vai jogar?",
    player1: "Jogador 1",
    player2: "Jogador 2",
    continue: "Continuar",
    chooseTitle: "Escolha um jogo",
    betName: "Aposto que você acha que eu diria…",
    betDesc: "Um responde. O outro adivinha.",
    courtName: "Tribunal do Casal",
    courtDesc: "Culpado ou inocente?",
    comingSoon: "Em breve",
    categoriesTitle: "Que tipo de pergunta?",
    play: "Jogar",
    loading: "Carregando…",
    loadError: "Não foi possível carregar o jogo. Verifique a conexão e tente de novo.",
    back: "Voltar",
    roundN: "Rodada {n}",
    passTo: "Passe para {name}",
    imName: "Sou {name}",
    betIntro: "{name} responde por si. {other} tenta adivinhar.",
    answerPrivately: "{name}, responda em segredo",
    caseN: "Caso nº {n}",
    votePrivately: "{name}, vote em segredo",
    courtHandoffSecond: "{name}, hora de dar o seu veredito.",
    courtRevoteHandoff: "Segunda votação. {name} vota primeiro.",
    yourVerdict: "Seu veredito",
    guilty: "Culpado",
    notGuilty: "Inocente",
    bothGuilty: "Os dois declararam culpado",
    bothNotGuilty: "Os dois declararam inocente",
    disagreement: "Discordância",
    courtInSession: "O tribunal está em sessão",
    nextPrompt: "Próximo",
    skipDebate: "Pular para o veredito",
    finalQuestion: "Pergunta final",
    positionChanged: "Alguém mudou de ideia?",
    revote: "Votar de novo",
    nextCase: "Próximo caso",
    betHandoffPredictor: "{name}, adivinhe o que {other} respondeu.",
    answerYourself: "Responda por você",
    predictAnswer: "Adivinhe a resposta de {name}",
    answerPlaceholder: "Digite sua resposta…",
    lockIn: "Confirmar",
    placeDown: "Coloquem o celular onde os dois possam ver",
    reveal: "Revelar",
    said: "{name} disse",
    predicted: "{name} apostou",
    nextRound: "Próxima rodada",
    menu: "Menu",
    close: "Fechar",
    changeCategories: "Mudar categorias",
    switchGame: "Trocar de jogo",
    newGame: "Novo jogo",
    exhaustedTitle: "Vocês jogaram todas as cartas!",
    reshuffle: "Embaralhar de novo",
  },
};

export const LANGS = Object.keys(strings);

export function detectLang(nav = globalThis.navigator) {
  return nav?.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

let lang = "en";

export function getLang() {
  return lang;
}

export function setLang(next) {
  if (LANGS.includes(next)) lang = next;
}

export function t(key, vars = {}) {
  const template = strings[lang][key] ?? strings.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
}

// Content fields are either plain strings or { en, pt } objects.
export function loc(field) {
  if (typeof field === "string") return field;
  return field?.[lang] || field?.en || "";
}
