import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import ChallengeRenderer from './ChallengeRenderer';
import { sampleLesson } from './sampleLesson';

export default function LessonPlayerDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const currentChallenge = sampleLesson[currentIndex];
  const completedCount = Object.keys(completed).length;
  const progressPercent = Math.round((completedCount / sampleLesson.length) * 100);

  const totalXp = useMemo(() => {
    return sampleLesson
      .filter((item) => completed[item.id])
      .reduce((sum, item) => sum + item.xp, 0);
  }, [completed]);

  const handleComplete = () => {
    setCompleted((prev) => ({
      ...prev,
      [currentChallenge.id]: true,
    }));

    if (currentIndex < sampleLesson.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(sampleLesson.length - 1, prev + 1));
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white border border-zinc-200 shadow-sm p-5 md:p-6 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-indigo-500">
                A1 • Day 1 • Demo
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-2">
                Player estilo Duolingo/Busuu
              </h1>
              <p className="text-zinc-500 mt-2">
                Uma atividade por vez, com progresso no topo e interação por habilidade.
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-50 px-5 py-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <Trophy size={18} />
                {totalXp} XP
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm font-semibold text-zinc-600 mb-2">
              <span>
                Atividade {currentIndex + 1} de {sampleLesson.length}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <ChallengeRenderer
          challenge={currentChallenge}
          onComplete={handleComplete}
          isCompleted={!!completed[currentChallenge.id]}
        />

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-40"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={currentIndex === sampleLesson.length - 1}
            className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-40"
          >
            Próxima
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
