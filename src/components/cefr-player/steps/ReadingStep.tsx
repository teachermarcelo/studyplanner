import React, { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ReadingStepData } from '../types';

type Props = {
  step: ReadingStepData;
  onNext: () => void;
};

export default function ReadingStep({ step, onNext }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [resultShown, setResultShown] = useState<Record<number, boolean>>({});

  const correctCount = useMemo(() => {
    return step.questions.filter((q, index) => answers[index] === q.correct).length;
  }, [answers, step.questions]);

  const finished = Object.keys(resultShown).length === step.questions.length;

  const handlePick = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    setResultShown((prev) => ({ ...prev, [questionIndex]: true }));
  };

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-red-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-red-500">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-100 overflow-y-auto">
          <p className="text-[17px] leading-8 text-zinc-800">{step.text}</p>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-5">
            {step.questions.map((question, index) => {
              const selected = answers[index];
              const isAnswered = resultShown[index];
              const isCorrect = selected === question.correct;

              return (
                <div key={index} className="rounded-2xl border border-zinc-200 p-4">
                  <p className="font-bold text-zinc-900 mb-3">
                    {index + 1}. {question.question}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const picked = selected === optionIndex;
                      const shouldHighlightCorrect = isAnswered && optionIndex === question.correct;

                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handlePick(index, optionIndex)}
                          className={[
                            'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                            shouldHighlightCorrect
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : picked && isAnswered && !isCorrect
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700',
                          ].join(' ')}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="mt-3 text-sm">
                      <div
                        className={[
                          'font-bold inline-flex items-center gap-2',
                          isCorrect ? 'text-green-600' : 'text-red-600',
                        ].join(' ')}
                      >
                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                      {question.explanation && (
                        <p className="text-zinc-500 mt-1">{question.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
        <p className="text-sm text-zinc-500">
          Correct answers: <span className="font-bold text-zinc-800">{correctCount}/{step.questions.length}</span>
        </p>

        <button
          type="button"
          onClick={onNext}
          disabled={!finished}
          className={[
            'rounded-2xl px-6 py-3 font-bold text-white transition-all',
            finished ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
