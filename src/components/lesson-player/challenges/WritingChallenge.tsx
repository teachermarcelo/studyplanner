import React, { useMemo, useState } from 'react';
import { CheckCircle2, PencilLine } from 'lucide-react';
import { ChallengeProps, WritingChallengeData } from '../types';

export default function WritingChallenge({
  challenge,
  onComplete,
  isCompleted,
}: ChallengeProps<WritingChallengeData>) {
  const [text, setText] = useState('');

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const canComplete = wordCount >= challenge.minWords;

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-100 bg-gradient-to-r from-sky-50 to-white">
        <div className="flex items-center gap-2 text-sky-600 font-bold uppercase tracking-wider text-xs">
          <PencilLine size={16} />
          {challenge.subtitle || 'Writing'}
        </div>
        <h2 className="mt-3 text-3xl font-black text-zinc-900">{challenge.title}</h2>
        <p className="mt-3 text-zinc-700">{challenge.prompt}</p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write your answer in English..."
          className="w-full min-h-[220px] rounded-2xl border border-zinc-200 p-4 outline-none focus:border-sky-500 resize-y text-zinc-900"
        />

        <div className="rounded-2xl bg-zinc-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Minimum words</span>
            <span className="font-bold text-zinc-900">
              {wordCount} / {challenge.minWords}
            </span>
          </div>

          {challenge.modelAnswer && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-500 mb-2">Model answer</p>
              <p className="text-zinc-700">{challenge.modelAnswer}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between pt-2">
          <div className="text-sm text-zinc-500">
            Para o MVP, basta atingir o mínimo de palavras para concluir.
          </div>

          <button
            type="button"
            onClick={onComplete}
            disabled={!canComplete || isCompleted}
            className={[
              'rounded-2xl px-6 py-4 font-bold text-white transition-all',
              canComplete && !isCompleted
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
              'Finalizar escrita'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
