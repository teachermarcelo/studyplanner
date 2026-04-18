import React, { useMemo, useState } from 'react';
import { Volume2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ChallengeProps, ListeningChallengeData } from '../types';

export default function ListeningChallenge({
  challenge,
  onComplete,
  isCompleted,
}: ChallengeProps<ListeningChallengeData>) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);

  const allCorrect = useMemo(() => {
    return challenge.questions.every((q, index) => answers[index] === q.correct);
  }, [answers, challenge.questions]);

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta TTS nativo.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(challenge.audioText);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const replayAudio = () => {
    window.speechSynthesis.cancel();
    playAudio();
  };

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs">
          <Volume2 size={16} />
          {challenge.subtitle || 'Listening'}
        </div>
        <h2 className="mt-3 text-3xl font-black text-zinc-900">{challenge.title}</h2>
        <p className="mt-3 text-zinc-700">{challenge.prompt}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={playAudio}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3"
          >
            {isPlaying ? 'Reproduzindo...' : 'Ouvir áudio'}
          </button>

          <button
            type="button"
            onClick={replayAudio}
            className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Repetir
          </button>
        </div>
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
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
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
            Ouça com atenção e responda corretamente para avançar.
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
