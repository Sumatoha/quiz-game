"use client";
import { useRef, useState, type ChangeEvent } from "react";
import { AI_PROMPT, C, SAMPLE_JSON, TOPIC_PASTEL } from "@/lib/constants";
import { parseQuizFile } from "@/lib/parser";
import type { Round } from "@/lib/types";
import {
  countQuestions,
  isQuizComplete,
  makeEmptyTopic,
  uid,
} from "@/lib/utils";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Tag } from "./ui/Tag";
import { Textarea } from "./ui/Textarea";

interface SetupPhaseProps {
  rounds: Round[];
  setRounds: (rounds: Round[]) => void;
  onNext: () => void;
}

export function SetupPhase({ rounds, setRounds, onNext }: SetupPhaseProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showImport, setShowImport] = useState(false);
  const [importErr, setImportErr] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      setPromptCopied(false);
    }
  };

  const toggle = (topicId: string) =>
    setCollapsed((prev) => ({ ...prev, [topicId]: !prev[topicId] }));

  const addRound = () =>
    setRounds([
      ...rounds,
      { id: uid(), name: `Раунд ${rounds.length + 1}`, topics: [] },
    ]);

  const removeRound = (rid: string) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter((r) => r.id !== rid));
  };

  const updateRoundName = (rid: string, name: string) =>
    setRounds(rounds.map((r) => (r.id === rid ? { ...r, name } : r)));

  const addTopic = (rid: string) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid ? { ...r, topics: [...r.topics, makeEmptyTopic()] } : r,
      ),
    );

  const removeTopic = (rid: string, tid: string) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid ? { ...r, topics: r.topics.filter((t) => t.id !== tid) } : r,
      ),
    );

  const updateTopicName = (rid: string, tid: string, name: string) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid
          ? {
              ...r,
              topics: r.topics.map((t) => (t.id === tid ? { ...t, name } : t)),
            }
          : r,
      ),
    );

  const addQuestion = (rid: string, tid: string) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid
          ? {
              ...r,
              topics: r.topics.map((t) =>
                t.id === tid
                  ? {
                      ...t,
                      questions: [
                        ...t.questions,
                        {
                          id: uid(),
                          text: "",
                          answer: "",
                          points: (t.questions.length + 1) * 10,
                        },
                      ],
                    }
                  : t,
              ),
            }
          : r,
      ),
    );

  const removeQuestion = (rid: string, tid: string, qid: string) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid
          ? {
              ...r,
              topics: r.topics.map((t) =>
                t.id === tid
                  ? { ...t, questions: t.questions.filter((q) => q.id !== qid) }
                  : t,
              ),
            }
          : r,
      ),
    );

  const updateQuestionField = (
    rid: string,
    tid: string,
    qid: string,
    key: "text" | "answer" | "points",
    value: string | number,
  ) =>
    setRounds(
      rounds.map((r) =>
        r.id === rid
          ? {
              ...r,
              topics: r.topics.map((t) =>
                t.id === tid
                  ? {
                      ...t,
                      questions: t.questions.map((q) =>
                        q.id === qid ? { ...q, [key]: value } : q,
                      ),
                    }
                  : t,
              ),
            }
          : r,
      ),
    );

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportErr("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result;
        if (typeof content !== "string") throw new Error("Не удалось прочитать файл");
        const parsed = parseQuizFile(file.name, content);
        setRounds(parsed);
        setShowImport(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Ошибка разбора";
        setImportErr(message);
      }
    };
    reader.readAsText(file);
  };

  const totalQ = countQuestions(rounds);
  const canGo = isQuizComplete(rounds);

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "28px 16px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "inline-block",
            background: C.yellow,
            border: `3px solid ${C.ink}`,
            borderRadius: 14,
            padding: "4px 16px",
            marginBottom: 12,
            boxShadow: `3px 3px 0px ${C.ink}`,
            fontSize: 12,
            fontWeight: 800,
            color: C.ink,
            letterSpacing: "0.08em",
          }}
        >
          ШАГ 1 / 2
        </div>
        <h1
          style={{
            fontSize: 48,
            fontFamily: "'Fraunces', serif",
            fontWeight: 900,
            color: C.ink,
            margin: "0 0 4px",
            lineHeight: 1.1,
          }}
        >
          Собери свой квиз ✏️
        </h1>
        <p style={{ color: C.inkMuted, fontSize: 15, margin: 0 }}>
          Раунды → темы → вопросы. Или загрузи из файла!
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <Button
          color={C.cream}
          textColor={C.ink}
          small
          onClick={() => setShowImport(!showImport)}
          style={{ border: `2px solid ${C.inkPale}`, boxShadow: "none" }}
        >
          {showImport ? "Скрыть ×" : "📁 Импорт JSON / CSV"}
        </Button>
      </div>

      {showImport && (
        <div
          className="pop-card"
          style={{ padding: 20, marginBottom: 24, animation: "slideUp 0.2s" }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <Tag bg={C.mintPale} color={C.mint}>
              JSON
            </Tag>
            <Tag bg={C.yellowPale} color={C.inkSoft}>
              CSV
            </Tag>
          </div>

          <div
            style={{
              background: C.violetPale,
              border: `2px solid ${C.violet}35`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 18 }}>✨</span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.violet,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Сгенерируй квиз через ИИ за 30 секунд
              </span>
            </div>
            <ol
              style={{
                margin: "0 0 12px",
                paddingLeft: 20,
                color: C.inkSoft,
                fontSize: 13,
                lineHeight: 1.7,
                fontWeight: 600,
              }}
            >
              <li>
                Скопируй промпт ниже и открой{" "}
                <strong style={{ color: C.violet }}>ChatGPT / Claude / Gemini</strong>
              </li>
              <li>Вставь промпт, в конце впиши свои темы и количество раундов</li>
              <li>Сохрани ответ ИИ в файл <code style={{ background: C.white, padding: "1px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>quiz.json</code> и загрузи сюда ↓</li>
            </ol>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                color={C.violet}
                small
                onClick={copyPrompt}
              >
                {promptCopied ? "✓ Скопировано!" : "📋 Скопировать промпт"}
              </Button>
              <details style={{ flex: 1, minWidth: 0 }}>
                <summary
                  style={{
                    fontSize: 12,
                    color: C.violet,
                    cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    padding: "6px 12px",
                    background: `${C.white}80`,
                    borderRadius: 10,
                    border: `2px solid ${C.violet}25`,
                    display: "inline-block",
                  }}
                >
                  Посмотреть промпт
                </summary>
                <pre
                  style={{
                    background: C.ink,
                    borderRadius: 12,
                    padding: 14,
                    marginTop: 8,
                    fontSize: 11,
                    color: C.violetPale,
                    fontFamily: "'JetBrains Mono', monospace",
                    overflow: "auto",
                    lineHeight: 1.6,
                    maxHeight: 280,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {AI_PROMPT}
                </pre>
              </details>
            </div>
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `3px dashed ${C.inkPale}`,
              borderRadius: 16,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: C.cream,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.blue)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.inkPale)}
          >
            <div style={{ fontSize: 36, marginBottom: 6 }}>📄</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
              Нажми чтобы загрузить
            </div>
            <div style={{ fontSize: 13, color: C.inkMuted, marginTop: 4 }}>
              .json или .csv
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.tsv"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </div>
          {importErr && (
            <div
              style={{
                marginTop: 10,
                color: C.danger,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ⚠ {importErr}
            </div>
          )}
          <details style={{ marginTop: 14 }}>
            <summary
              style={{
                fontSize: 12,
                color: C.inkMuted,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              Пример JSON
            </summary>
            <pre
              style={{
                background: C.ink,
                borderRadius: 12,
                padding: 14,
                marginTop: 8,
                fontSize: 11,
                color: C.mint,
                fontFamily: "'JetBrains Mono', monospace",
                overflow: "auto",
                lineHeight: 1.6,
              }}
            >
              {SAMPLE_JSON}
            </pre>
          </details>
        </div>
      )}

      {rounds.map((round, ri) => (
        <div key={round.id} className="pop-card" style={{ padding: 22, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: C.blue,
                border: `3px solid ${C.ink}`,
                boxShadow: `3px 3px 0 ${C.ink}`,
                fontWeight: 900,
                fontSize: 16,
                color: "#fff",
                fontFamily: "'Fraunces', serif",
                flexShrink: 0,
              }}
            >
              {ri + 1}
            </div>
            <Input
              value={round.name}
              onChange={(v) => updateRoundName(round.id, v)}
              placeholder="Название раунда"
              style={{ fontWeight: 700, fontSize: 16, background: C.white }}
            />
            {rounds.length > 1 && (
              <button
                type="button"
                onClick={() => removeRound(round.id)}
                style={{
                  background: C.cream,
                  border: `2px solid ${C.inkPale}`,
                  borderRadius: 10,
                  color: C.inkMuted,
                  cursor: "pointer",
                  fontSize: 14,
                  padding: "4px 8px",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {round.topics.map((topic, ti) => {
            const isOpen = !collapsed[topic.id];
            const tc = TOPIC_PASTEL[ti % TOPIC_PASTEL.length];
            const filled = topic.questions.filter((q) => q.text.trim()).length;
            return (
              <div
                key={topic.id}
                style={{
                  background: tc.bg,
                  border: `2px solid ${tc.border}40`,
                  borderRadius: 14,
                  marginBottom: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(topic.id)}
                >
                  <span
                    style={{
                      fontSize: 11,
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                      color: tc.text,
                    }}
                  >
                    ▶
                  </span>
                  <Tag bg={`${tc.border}20`} color={tc.text}>
                    T{ti + 1}
                  </Tag>
                  <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={topic.name}
                      onChange={(v) => updateTopicName(round.id, topic.id, v)}
                      placeholder="Название темы"
                      style={{ background: `${C.white}aa` }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 6,
                        borderRadius: 3,
                        background: C.white,
                        overflow: "hidden",
                        border: `1px solid ${tc.border}30`,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${topic.questions.length ? (filled / topic.questions.length) * 100 : 0}%`,
                          background: tc.border,
                          borderRadius: 3,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: tc.text,
                        fontWeight: 700,
                      }}
                    >
                      {filled}/{topic.questions.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTopic(round.id, topic.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: tc.text,
                      cursor: "pointer",
                      fontSize: 14,
                      opacity: 0.5,
                    }}
                  >
                    ✕
                  </button>
                </div>
                {isOpen && (
                  <div
                    style={{
                      padding: 12,
                      borderTop: `1px solid ${tc.border}25`,
                      background: `${C.white}40`,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "26px 1fr 1fr 60px 22px",
                        gap: "3px 6px",
                        marginBottom: 6,
                      }}
                    >
                      {["#", "ВОПРОС", "ОТВЕТ", "PTS", ""].map((h, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 9,
                            color: C.inkLight,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    {topic.questions.map((q, qi) => (
                      <div
                        key={q.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "26px 1fr 1fr 60px 22px",
                          gap: "3px 6px",
                          alignItems: "start",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 11,
                            color: C.inkLight,
                            width: 22,
                            height: 22,
                            borderRadius: 7,
                            background: `${tc.border}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 5,
                            fontWeight: 700,
                          }}
                        >
                          {qi + 1}
                        </span>
                        <Textarea
                          value={q.text}
                          onChange={(v) =>
                            updateQuestionField(round.id, topic.id, q.id, "text", v)
                          }
                          placeholder="Вопрос..."
                          rows={1}
                        />
                        <Textarea
                          value={q.answer}
                          onChange={(v) =>
                            updateQuestionField(round.id, topic.id, q.id, "answer", v)
                          }
                          placeholder="Ответ..."
                          rows={1}
                        />
                        <Input
                          type="number"
                          value={q.points}
                          onChange={(v) =>
                            updateQuestionField(
                              round.id,
                              topic.id,
                              q.id,
                              "points",
                              parseInt(v, 10) || 0,
                            )
                          }
                          style={{
                            textAlign: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            background: C.white,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeQuestion(round.id, topic.id, q.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: C.inkLight,
                            cursor: "pointer",
                            fontSize: 11,
                            paddingTop: 8,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <Button
                      color={tc.bg}
                      textColor={tc.text}
                      small
                      onClick={() => addQuestion(round.id, topic.id)}
                      style={{
                        boxShadow: "none",
                        border: `2px dashed ${tc.border}50`,
                        marginTop: 6,
                      }}
                    >
                      + Вопрос
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          <Button
            color={C.cream}
            textColor={C.inkMuted}
            small
            onClick={() => addTopic(round.id)}
            style={{
              boxShadow: "none",
              border: `2px dashed ${C.inkPale}`,
              marginTop: 6,
            }}
          >
            + Тема
          </Button>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Button
          color={C.cream}
          textColor={C.ink}
          onClick={addRound}
          style={{ boxShadow: "none", border: `2px dashed ${C.inkPale}` }}
        >
          + Раунд
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Tag bg={C.cream} color={C.inkMuted}>
            {totalQ} вопросов
          </Tag>
          <Button color={C.blue} onClick={onNext} disabled={!canGo}>
            Далее →
          </Button>
        </div>
      </div>
    </div>
  );
}
