import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, RotateCcw, StopCircle } from 'lucide-react';
import { SpeakingStepData } from '../types';

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

type Props = {
  step: SpeakingStepData;
  onNext: () => void;
};

type ScoreColor = 'green' | 'yellow' | 'red';

function scoreByKeywords(found: number, total: number): ScoreColor {
  const ratio = total === 0 ? 0 : found / total;
  if (ratio >= 0.75) return 'green';
  if (ratio >= 0.4) return 'yellow';
  return 'red';
}

export default function SpeakingStep({ step, onNext }: Props) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [transcript, setTranscript] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  const current = step.tasks[taskIndex];
  const text = transcript[taskIndex] || '';

  const foundKeywords = useMemo(() => {
    const normalized = text.toLowerCase();
    return current.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase()));
  }, [text, current.keywords]);

  const score = scoreByKeywords(foundKeywords.length, current.keywords.length);
  const allDone = step.tasks.every((_, index) => !!transcript[index]);

  const supportsRecognition =
    typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop?.();
    };
  }, []);

  const paint = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }[score];

  const label = {
    green: 'Very good',
    yellow: 'Almost there',
    red: 'Needs improvement',
  }[score];

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsRecording(false);
  };

  const scheduleAutoStop = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 1800);
  };

  const startRecording = () => {
    if (!supportsRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz nativo.');
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
      scheduleAutoStop();
    };

    recognition.onresult = (event: any) => {
      let combined = '';
      for (let i = 0; i < event.results.length; i += 1) {
        combined += event.results[i][0].transcript + ' ';
      }
      setTranscript((prev) => ({
        ...prev,
        [taskIndex]: combined.trim(),
      }));
      scheduleAutoStop();
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const recordAgain = () => {
    setTranscript((prev) => ({
      ...prev,
      [taskIndex]: '',
    }));
  };

  return (
    <div className="h-full flex flex-col rounded-[28px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-white">
        <p className="text-xs uppercase tracking-[0.25em] font-bold text-amber-600">{step.subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-900 mt-2">{step.title}</h2>
      </div>

      <div className="flex-1 min-h-0 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-zinc-500">
              Speaking task {taskIndex + 1} of {step.tasks.length}
            </div>
            <div className="text-sm text-zinc-500">
              Completed: <span className="font-bold text-zinc-900">{step.tasks.filter((_, i) => transcript[i]).length}/{step.tasks.length}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 p-6 bg-zinc-50">
            <p className="font-bold text-zinc-900 text-lg">{current.prompt}</p>

            <div className="mt-4 rounded-2xl bg-white border border-zinc-200 p-4">
              <p className="text-sm font-semibold text-zinc-500 mb-2">Target</p>
              <p className="text-zinc-800">{current.targetSentence}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startRecording}
                disabled={isRecording}
                className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Mic size={18} />
                {isRecording ? 'Recording...' : 'Record'}
              </button>

              <button
                type="button"
                onClick={stopRecording}
                className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
              >
                <StopCircle size={18} />
                Stop recording
              </button>

              <button
                type="button"
                onClick={recordAgain}
                className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
              >
                <RotateCcw size={18} />
                Record again
              </button>
            </div>

            <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4">
              <div className="rounded-2xl bg-white border border-zinc-200 p-4">
                <p className="text-sm font-semibold text-zinc-500 mb-2">Your transcript</p>
                <p className="text-zinc-900 min-h-[48px]">{text || 'Your speech will appear here.'}</p>
              </div>

              <div className={['rounded-2xl border px-5 py-4 font-bold min-w-[180px] flex items-center justify-center', paint].join(' ')}>
                {label}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-500 mb-2">Keyword feedback</p>
              <div className="flex flex-wrap gap-2">
                {current.keywords.map((keyword) => {
                  const found = foundKeywords.includes(keyword);
                  return (
                    <span
                      key={keyword}
                      className={[
                        'px-3 py-2 rounded-full text-sm font-bold border',
                        found ? 'bg-green-50 text-green-700 border-green-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200',
                      ].join(' ')}
                    >
                      {keyword}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 flex items-center justify-between">
          <div className="text-sm text-zinc-500">
            The recording stops automatically after silence. You can record again if needed.
          </div>

          {taskIndex < step.tasks.length - 1 ? (
            <button
              type="button"
              onClick={() => setTaskIndex((prev) => prev + 1)}
              disabled={!transcript[taskIndex]}
              className={[
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                transcript[taskIndex] ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed',
              ].join(' ')}
            >
              Next task
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={!allDone}
              className={[
                'rounded-2xl px-6 py-3 font-bold text-white transition-all',
                allDone ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-zinc-300 cursor-not-allowed',
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
