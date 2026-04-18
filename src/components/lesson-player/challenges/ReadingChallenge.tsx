import React, { useMemo, useState } from 'react';
import { CheckCircle2, CircleHelp } from 'lucide-react';
import { ChallengeProps, ReadingChallengeData } from '../types';

export default function ReadingChallenge({
  challenge,
  onComplete,
  isCompleted,
}: ChallengeProps<ReadingChallengeData>) {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const allCorrect = useMemo(() => {
    return challenge.questions.every((q, index) => answers[index] === q.correct);
  }, [answers, challenge.questions]);

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-100 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-xs">
          <CircleHelp size={16} />
          {challenge.subtitle || 'Reading'}
        </div>
        <h2 className="mt-3 text-3xl font-black text-zinc-900">{challenge.title}</h2>
        <p className="mt-3 text-zinc-700 leading-8 text-lg">{challenge.text}</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {challenge.questions.map((question, index) => (
          <div key={index} className="rounded-2xl border border-zinc-200 p-5">
            <p className="font-bold text-zinc-900 mb-4">
              {index + 1}. {question.question}
            </p>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => {
                const selected = answers[index] === optionIndex;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [index]: optionIndex,
                      }))
                    }
                    className={[
                      'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                      selected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between pt-2">
          <div className="text-sm text-zinc-500">
            Marque as respostas corretas para concluir esta atividade.
          </div>

          <button
            type="button"
            onClick={onComplete}
            disabled={!allCorrect || isCompleted}
            className={[
              'rounded-2xl px-6 py-4 font-bold text-white transition-all',
              allCorrect && !isCompleted
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-zinc-300 cursor-not-allowed',
            ].join(' ')}
          >
            {isCompleted ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={18} />
                Concluída
              </span>
            ) : (
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
