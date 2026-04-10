import type { Question, Round, Topic } from "./types";

export const uid = (): string => Math.random().toString(36).slice(2, 9);

export const makeDefaultQuestions = (count = 10): Question[] =>
  Array.from({ length: count }, (_, i) => ({
    id: uid(),
    text: "",
    answer: "",
    points: (i + 1) * 10,
  }));

export const makeEmptyTopic = (): Topic => ({
  id: uid(),
  name: "",
  questions: makeDefaultQuestions(),
});

export const makeEmptyRound = (index: number): Round => ({
  id: uid(),
  name: `Раунд ${index + 1}`,
  topics: [makeEmptyTopic()],
});

export const countQuestions = (rounds: Round[]): number =>
  rounds.reduce(
    (acc, r) => acc + r.topics.reduce((b, t) => b + t.questions.length, 0),
    0,
  );

export const isQuizComplete = (rounds: Round[]): boolean =>
  rounds.length > 0 &&
  rounds.every(
    (r) =>
      r.topics.length > 0 &&
      r.topics.every(
        (t) =>
          t.name.trim().length > 0 &&
          t.questions.length > 0 &&
          t.questions.every((q) => q.text.trim().length > 0),
      ),
  );
