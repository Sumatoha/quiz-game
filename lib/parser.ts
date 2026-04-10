import type { Round } from "./types";
import { uid } from "./utils";

interface RawQuestion {
  text?: string;
  answer?: string;
  points?: number;
}
interface RawTopic {
  name?: string;
  questions?: RawQuestion[];
}
interface RawRound {
  name?: string;
  topics?: RawTopic[];
}
interface RawQuiz {
  rounds?: RawRound[];
}

export function parseCSV(text: string): RawQuiz {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.split(/[,\t]/).map((c) => c.trim().replace(/^"|"$/g, "")));
  if (lines.length < 2) throw new Error("Мало строк");

  const header = lines[0].map((x) => x.toLowerCase());
  const ri = header.indexOf("round");
  const ti = header.indexOf("topic");
  const qi = header.indexOf("question");
  const ai = header.indexOf("answer");
  const pi = header.indexOf("points");
  if (qi === -1) throw new Error("Нужен столбец 'question'");

  const grouped: Record<string, Record<string, RawQuestion[]>> = {};
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    const roundName = ri >= 0 ? row[ri] || "Раунд 1" : "Раунд 1";
    const topicName = ti >= 0 ? row[ti] || "Тема 1" : "Тема 1";
    if (!grouped[roundName]) grouped[roundName] = {};
    if (!grouped[roundName][topicName]) grouped[roundName][topicName] = [];
    const list = grouped[roundName][topicName];
    list.push({
      text: row[qi] || "",
      answer: ai >= 0 ? row[ai] || "" : "",
      points: pi >= 0 ? parseInt(row[pi], 10) || 10 : list.length * 10 + 10,
    });
  }

  return {
    rounds: Object.entries(grouped).map(([name, topics]) => ({
      name,
      topics: Object.entries(topics).map(([tn, qs]) => ({
        name: tn,
        questions: qs,
      })),
    })),
  };
}

export function normalizeQuiz(data: RawQuiz): Round[] {
  if (!data.rounds?.length) throw new Error("Нужен 'rounds' массив");
  return data.rounds.map((r) => ({
    id: uid(),
    name: r.name || "Раунд",
    topics: (r.topics || []).map((t) => ({
      id: uid(),
      name: t.name || "Тема",
      questions: (t.questions || []).map((q, i) => ({
        id: uid(),
        text: q.text || "",
        answer: q.answer || "",
        points: q.points || (i + 1) * 10,
      })),
    })),
  }));
}

export function parseQuizFile(filename: string, content: string): Round[] {
  const isCsv = /\.(csv|tsv)$/i.test(filename);
  const data: RawQuiz = isCsv ? parseCSV(content) : JSON.parse(content);
  return normalizeQuiz(data);
}
