import React, { useMemo, useState } from 'react';
import { Volume2, FileText } from 'lucide-react';
import { ListeningStepData } from '../types';

type Props = {
  step: ListeningStepData;
  onNext: () => void;
};

export default function ListeningStep({ step, onNext }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showTranscript, setShowTranscript] = useState<Record<number, boolean>>({});

  const current = step.exercises[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const finished = answeredCount === step.exercises.length;

  const playAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta TTS.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.audioText);
    utterance.lang = 'en-US';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const currentPicked = answers[currentIndex];
  const currentCorrect = currentPicked === current.correct;

  const totalCorrect = useMemo(() => {
    return step.exercises.filter((exercise, index) => answers[index] === exercise.correct).length;
  }, [answers, step.exercises]);

  const handleOption = (optionIndex: number) => {
    if (answers[currentIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const nextExercise = () => {
    setCurrentIndex((prev) => Math.min(step.exercises.length - 1, prev + 1));
  };

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-emerald-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-zinc-500">
              Audio {currentIndex + 1} of {step.exercises.length}
            </div>
            <div className="text-sm text-zinc-500">
              Correct: <span className="font-bold text-zinc-900">{totalCorrect}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 p-6 bg-zinc-50">
            <div className="flex flex-wrap gap-3 mb-5">
              <button
                type="button"
                onClick={playAudio}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 inline-flex items-center gap-2"
              >
                <Volume2 size={18} />
                Play audio
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowTranscript((prev) => ({
                    ...prev,
                    [currentIndex]: !prev[currentIndex],
                  }))
                }
                className="rounded-2xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
              >
                <FileText size={18} />
                {showTranscript[currentIndex] ? 'Hide transcription' : 'View transcription'}
              </button>
            </div>

            {showTranscript[currentIndex] && (
              <div className="rounded-2xl bg-white border border-zinc-200 p-4 mb-5 text-zinc-700">
                {current.transcription}
              </div>
            )}

            <p className="font-bold text-zinc-900 mb-4">{current.question}</p>

            <div className="space-y-3">
              {current.options.map((option, optionIndex) => {
                const picked = currentPicked === optionIndex;
                const revealCorrect = currentPicked !== undefined && optionIndex === current.correct;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => handleOption(optionIndex)}
                    disabled={currentPicked !== undefined}
                    className={[
                      'w-full text-left rounded-2xl border px-4 py-3 font-semibold transition-all',
                      revealCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : picked && currentPicked !== current.correct
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {currentPicked !== undefined && (
              <div className={['mt-4 font-bold', currentCorrect ? 'text-green-600' : 'text-red-600'].join(' ')}>
                {currentCorrect ? 'Correct' : 'Incorrect'}
              </div>
            )}
          </div>
        </div>

        <div className="pt-5 flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            Each audio is corrected as soon as the learner clicks an option.
          </div>

          {currentIndex < step.exercises.length - 1 ? (
            <button
              type="button"
              onClick={nextExercise}
              disabled={currentPicked === undefined}
              className={[
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                currentPicked !== undefined ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed',
              ].join(' ')}
            >
              Next audio
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
