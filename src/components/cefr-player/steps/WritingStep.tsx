import React, { useMemo, useState } from 'react';
import { WritingStepData } from '../types';

type Props = {
  step: WritingStepData;
  onNext: () => void;
};

export default function WritingStep({ step, onNext }: Props) {
  const [text, setText] = useState('');

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const canFinish = wordCount >= step.minWords;

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-sky-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-sky-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 grid md:grid-cols-[1fr_0.8fr] gap-5">
        <div className="flex flex-col min-h-0">
          <p className="font-bold text-zinc-900 mb-3">{step.prompt}</p>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write here in English..."
            className="flex-1 min-h-[260px] rounded-3xl border border-zinc-200 p-5 outline-none focus:border-sky-500 resize-none text-zinc-900"
          />
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-500">Words</span>
            <span className="font-black text-zinc-900">{wordCount}/{step.minWords}</span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-zinc-500 mb-2">Model answer</p>
            <p className="text-zinc-700 leading-7">{step.modelAnswer}</p>
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!canFinish}
            className={[
              'mt-6 w-full rounded-2xl px-6 py-4 font-bold text-white transition-all',
              canFinish ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed',
            ].join(' ')}
          >
            Finish day
          </button>
        </div>
      </div>
    </div>
  );
}
