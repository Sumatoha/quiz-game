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

export const AI_PROMPT = `Ты — конвертер вопросов для квиз-игры. Ниже я пришлю свои вопросы в свободной форме (текст, список, таблица, документ — как есть). Твоя задача: разобрать их и преобразовать в строго определённый JSON-формат. Ничего не придумывай от себя — работай только с тем, что я прислал.

ЧТО НАДО СДЕЛАТЬ:
1. Прочитай мои вопросы и пойми структуру: где раунды, где темы, где вопросы, где ответы, где баллы.
2. Если я не указал раунды — помести всё в "Раунд 1".
3. Если я не указал темы — сгруппируй вопросы по смыслу в осмысленные темы сам.
4. Если у вопроса не указаны баллы — проставь их по возрастанию: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 (исходя из порядка вопросов в теме).
5. Если я не указал ответ на вопрос — оставь поле "answer" пустой строкой "". НЕ выдумывай ответы.
6. Сохрани оригинальные формулировки вопросов и ответов без искажений — только чисти лишние пробелы, нумерацию, маркеры списков и прочий мусор.
7. Если вопросов в теме больше или меньше 10 — это нормально, сохрани как есть.

СТРОГИЙ ФОРМАТ ВЫВОДА:
{
  "rounds": [
    {
      "name": "название раунда",
      "topics": [
        {
          "name": "название темы",
          "questions": [
            { "text": "текст вопроса", "answer": "ответ", "points": 10 }
          ]
        }
      ]
    }
  ]
}

ПРАВИЛА ВЫВОДА:
- Только валидный JSON. Никаких пояснений, комментариев, markdown-блоков вокруг.
- Все строки в двойных кавычках. Внутренние кавычки экранируй как \\".
- "points" — целое число.
- Никакого лишнего текста до или после JSON.

МОИ ВОПРОСЫ (преобразуй их):

[ВСТАВЬ СЮДА СВОИ ВОПРОСЫ — можно как угодно: списком, текстом, скопированной таблицей, содержимым файла. Я разберусь.]`;
