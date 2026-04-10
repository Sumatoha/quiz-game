export const C = {
  cream: "#faf5eb",
  creamDark: "#f0e9d8",
  white: "#ffffff",
  ink: "#1a1a2e",
  inkSoft: "#2d2d44",
  inkMuted: "#6b6b82",
  inkLight: "#9999ad",
  inkPale: "#cdcdd8",
  blue: "#3d5afe",
  bluePale: "#e8ecff",
  pink: "#ff2d78",
  pinkPale: "#ffe4ee",
  yellow: "#ffc815",
  yellowPale: "#fff6d4",
  mint: "#00d68f",
  mintPale: "#d4fae9",
  orange: "#ff7043",
  orangePale: "#ffe4d9",
  violet: "#7c4dff",
  violetPale: "#ede4ff",
  correct: "#00c853",
  danger: "#ff1744",
  teams: [
    "#3d5afe",
    "#ff2d78",
    "#ffc815",
    "#00d68f",
    "#ff7043",
    "#7c4dff",
    "#00b0ff",
    "#ff6d00",
  ],
} as const;

export const TOPIC_HEADER_COLORS = [
  C.blue,
  C.pink,
  C.mint,
  C.orange,
  C.violet,
  C.yellow,
];

export const TOPIC_PASTEL = [
  { bg: C.pinkPale, border: C.pink, text: C.pink },
  { bg: C.bluePale, border: C.blue, text: C.blue },
  { bg: C.mintPale, border: C.mint, text: C.mint },
  { bg: C.yellowPale, border: C.yellow, text: C.inkSoft },
  { bg: C.orangePale, border: C.orange, text: C.orange },
  { bg: C.violetPale, border: C.violet, text: C.violet },
];

export const SAMPLE_JSON = `{
  "rounds": [
    {
      "name": "Раунд 1",
      "topics": [
        {
          "name": "География",
          "questions": [
            { "text": "Столица Японии?", "answer": "Токио", "points": 10 },
            { "text": "Самая длинная река?", "answer": "Нил", "points": 20 }
          ]
        }
      ]
    }
  ]
}`;

export const AI_PROMPT = `Составь квиз в формате JSON по приведённой ниже структуре. Я укажу темы и количество раундов — сгенерируй интересные вопросы с ответами.

СТРОГИЕ ПРАВИЛА ФОРМАТА:
- Корневой объект содержит массив "rounds".
- Каждый раунд: { "name": "...", "topics": [...] }
- В раунде от 2 до 5 тем.
- Каждая тема: { "name": "...", "questions": [...] }
- В теме ровно 10 вопросов.
- Каждый вопрос: { "text": "...", "answer": "...", "points": N }
- Баллы идут строго по возрастанию: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.
- Сложность вопроса растёт вместе с баллами (10 — очень лёгкий, 100 — очень сложный).
- Ответы должны быть короткими и однозначными (1-4 слова по возможности).
- Все вопросы и ответы — на русском языке.
- Никаких пояснений вокруг JSON. Только валидный JSON в ответе, без markdown-блоков.

ПРИМЕР СТРУКТУРЫ (для 1 темы):
{
  "rounds": [
    {
      "name": "Раунд 1",
      "topics": [
        {
          "name": "География",
          "questions": [
            { "text": "Столица Японии?", "answer": "Токио", "points": 10 },
            { "text": "Самая длинная река в мире?", "answer": "Нил", "points": 20 },
            { "text": "Сколько стран в Африке?", "answer": "54", "points": 30 },
            { "text": "Самое глубокое озеро в мире?", "answer": "Байкал", "points": 40 },
            { "text": "Столица Австралии?", "answer": "Канберра", "points": 50 },
            { "text": "Самая высокая гора Европы?", "answer": "Эльбрус", "points": 60 },
            { "text": "В какой стране находится Мачу-Пикчу?", "answer": "Перу", "points": 70 },
            { "text": "Самый маленький океан?", "answer": "Северный Ледовитый", "points": 80 },
            { "text": "Столица Буркина-Фасо?", "answer": "Уагадугу", "points": 90 },
            { "text": "Самый высокий водопад в мире?", "answer": "Анхель", "points": 100 }
          ]
        }
      ]
    }
  ]
}

МОЙ ЗАКАЗ:
Количество раундов: [например 2]
Темы раунда 1: [например: Кино, Музыка, Спорт, История]
Темы раунда 2: [например: Наука, Литература, Животные]
Дополнительно: [например: вопросы попроще для дружеской вечеринки]

Сгенерируй полный JSON по этим данным.`;
