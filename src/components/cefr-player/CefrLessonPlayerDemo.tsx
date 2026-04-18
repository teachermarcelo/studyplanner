import React, { useMemo, useState } from 'react';
import { sampleLessonA1 } from './sampleLessonA1';
import StepRenderer from './StepRenderer';
import { ChevronLeft } from 'lucide-react';

export default function CefrLessonPlayerDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = sampleLessonA1[stepIndex];

  const progressPercent = useMemo(() => {
    return Math.round((stepIndex / (sampleLessonA1.length - 1)) * 100);
  }, [stepIndex]);

  const next = () => {
    setStepIndex((prev) => Math.min(sampleLessonA1.length - 1, prev + 1));
  };

  const prev = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb] p-3 md:p-5">
      <div className="h-full max-w-6xl mx-auto flex flex-col">
        <div className="rounded-[28px] bg-white border border-zinc-200 shadow-sm px-5 py-4 mb-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={stepIndex === 0}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 disabled:opacity-40 inline-flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <div className="flex-1 max-w-3xl">
              <div className="flex items-center justify-between text-sm font-bold text-zinc-500 mb-2">
                <span>A1 · Day 1</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 px-4 py-3">
              <div className="text-sm font-bold text-indigo-700">One screen at a time</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <StepRenderer step={step} onNext={next} />
        </div>
      </div>
    </div>
  );
}
