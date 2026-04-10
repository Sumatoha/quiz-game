export interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
}

export interface Topic {
  id: string;
  name: string;
  questions: Question[];
}

export interface Round {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

export type Phase = "setup" | "teams" | "game" | "results";
