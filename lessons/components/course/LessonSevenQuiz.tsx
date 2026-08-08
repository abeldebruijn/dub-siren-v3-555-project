import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

type Question = {
  id: string;
  prompt: string;
  options: readonly string[];
  correct: number;
  explanation: string;
};

const questions: readonly Question[] = [
  {
    id: "selector-bits",
    prompt: "S0, S1, and S2 are all wired to GND. What binary value does this create?",
    options: ["111", "000", "001", "It depends on the pot positions"],
    correct: 1,
    explanation: "Ground means 0 on every selector bit, so S2 S1 S0 reads 000 — the code for channel 0.",
  },
  {
    id: "enable-polarity",
    prompt: "Why does pin 6 (ENABLE) go to GND instead of 3V3?",
    options: [
      "ENABLE is active-low, so grounding it turns the selected switch on",
      "It sets the chip to channel 0 directly",
      "3V3 would damage the chip",
      "It doesn't matter which voltage is used",
    ],
    correct: 0,
    explanation: "The bar over ENABLE in the datasheet means active-low: 0 V enables the selected switch. Driving it high would open every switch instead.",
  },
  {
    id: "capacitor-not-short",
    prompt: "Why doesn't the 100 nF capacitor between VCC and GND act as a short circuit?",
    options: [
      "It only conducts alternating current, never direct current",
      "Its two plates are separated by an insulator, so no steady DC path crosses it",
      "The capacitor is polarised so current can only flow one way",
      "100 nF is too small a value to conduct any current",
    ],
    correct: 1,
    explanation: "A capacitor's plates never touch — they're separated by a dielectric. It briefly charges, then blocks steady current, unlike a bare wire between 3V3 and GND.",
  },
  {
    id: "floating-selectors",
    prompt: "If S0, S1, and S2 were left disconnected instead of grounded, what would you expect?",
    options: [
      "CH0 would still be reliably selected",
      "COMMON would short directly to GND",
      "The selected channel could become unpredictable",
      "The chip would be permanently disabled",
    ],
    correct: 2,
    explanation: "Floating digital inputs have no defined 0 or 1. An unpredictable selector value could connect the wrong pot to COMMON at any moment.",
  },
  {
    id: "todays-channel",
    prompt: "Today, exactly one 4051 channel carries a real signal. Which one, and from which control?",
    options: ["CH7, from Trigger", "CH1, from Rate", "CH3, from Amount", "CH0, from Pitch"],
    correct: 3,
    explanation: "Pitch's wiper now lands on pin 13, CH0. COMMON (pin 3) carries that signal on to GP28, same as before the multiplexer was added.",
  },
];

export default function LessonSevenQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce((total, question) => total + (answers[question.id] === question.correct ? 1 : 0), 0);
  const complete = answeredCount === questions.length;

  function choose(questionId: string, optionIndex: number) {
    if (questionId in answers) return;
    setAnswers((previous) => ({ ...previous, [questionId]: optionIndex }));
  }

  return (
    <section className="course-quiz" aria-labelledby="mux-quiz-title">
      <header>
        <span>Check your understanding</span>
        <h3 id="mux-quiz-title">Multiplexer quiz</h3>
        {answeredCount > 0 ? (
          <output aria-live="polite">{score} / {answeredCount} correct{complete ? " · quiz complete" : ""}</output>
        ) : null}
      </header>
      <div className="course-quiz__questions">
        {questions.map((question, index) => {
          const chosen = answers[question.id];
          const isAnswered = chosen !== undefined;

          return (
            <div className="course-quiz__question" key={question.id}>
              <p className="course-quiz__prompt">
                <span>{index + 1}.</span> {question.prompt}
              </p>
              <div className="course-quiz__options">
                {question.options.map((option, optionIndex) => {
                  const isChosen = chosen === optionIndex;
                  const isCorrectOption = optionIndex === question.correct;
                  let state = "";
                  if (isAnswered && isCorrectOption) state = "course-quiz__option--correct";
                  else if (isAnswered && isChosen) state = "course-quiz__option--incorrect";

                  return (
                    <button
                      type="button"
                      key={option}
                      className={`course-quiz__option ${state}`.trim()}
                      onClick={() => choose(question.id, optionIndex)}
                      disabled={isAnswered}
                      aria-pressed={isChosen}
                    >
                      <span aria-hidden="true">
                        {isAnswered && isCorrectOption ? <Check /> : isAnswered && isChosen ? <X /> : null}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
              {isAnswered ? (
                <p className={chosen === question.correct ? "course-quiz__feedback course-quiz__feedback--correct" : "course-quiz__feedback course-quiz__feedback--incorrect"}>
                  {chosen === question.correct ? "Correct. " : "Not quite. "}
                  {question.explanation}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {complete ? (
        <footer className={score === questions.length ? "course-unlock course-unlock--ready" : "course-unlock"}>
          <div>
            <strong>{score === questions.length ? "Perfect score" : `${score} of ${questions.length} correct`}</strong>
            <p>{score === questions.length ? "You can explain every wire on this board." : "Reread the explanations above, then try again."}</p>
          </div>
          <button type="button" className="course-reset" onClick={() => setAnswers({})}>
            <RotateCcw aria-hidden="true" /> Retry quiz
          </button>
        </footer>
      ) : null}
    </section>
  );
}
