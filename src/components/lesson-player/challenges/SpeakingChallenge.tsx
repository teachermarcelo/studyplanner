import React, { useMemo, useRef, useState } from 'react';
import { Mic, CheckCircle2, StopCircle, RefreshCcw } from 'lucide-react';
import { ChallengeProps, SpeakingChallengeData } from '../types';

type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T }
  ? T
  : any;

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function SpeakingChallenge({
  challenge,
  onComplete,
  isCompleted,
}: ChallengeProps<SpeakingChallengeData>) {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const supportsRecognition = typeof window !== 'undefined'
    ? !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    : false;

  const matchedKeywords = useMemo(() => {
    const text = transcript.toLowerCase();
    return challenge.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  }, [transcript, challenge.keywords]);

  const canComplete = matchedKeywords.length >= Math.max(2, challenge.keywords.length - 1);

  const startRecording = () => {
    if (!supportsRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz nativo.');
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; i += 1) {
        fullText += event.results[i][0].transcript + ' ';
      }
      setTranscript(fullText.trim());
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop?.();
    setIsRecording(false);
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-wider text-xs">
          <Mic size={16} />
          {challenge.subtitle || 'Speaking'}
        </div>
        <h2 className="mt-3 text-3xl font-black text-zinc-900">{challenge.title}</h2>
        <p className="mt-3 text-zinc-700">{challenge.prompt}</p>

        <div className="mt-4 rounded-2xl bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-500 mb-2">Frase alvo</p>
          <p className="text-zinc-900 font-medium">{challenge.targetSentence}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startRecording}
            disabled={isRecording}
            className="rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Mic size={18} />
            {isRecording ? 'Gravando...' : 'Gravar voz'}
          </button>

          <button
            type="button"
            onClick={stopRecording}
            className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
          >
            <StopCircle size={18} />
            Parar
          </button>

          <button
            type="button"
            onClick={resetTranscript}
            className="rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 font-bold px-5 py-3 inline-flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Limpar
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-sm font-semibold text-zinc-500 mb-2">Transcrição</p>
          <p className="text-zinc-900 min-h-8">{transcript || 'Sua fala aparecerá aqui.'}</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-sm font-semibold text-zinc-500 mb-3">Palavras-chave encontradas</p>
          <div className="flex flex-wrap gap-2">
            {challenge.keywords.map((keyword) => {
              const found = matchedKeywords.includes(keyword);
              return (
                <span
                  key={keyword}
                  className={[
                    'px-3 py-2 rounded-full text-sm font-bold',
                    found ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500',
                  ].join(' ')}
                >
                  {keyword}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between pt-2">
          <div className="text-sm text-zinc-500">
            Para este MVP, a atividade conclui quando a transcrição reconhece as palavras-chave.
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
              'Continuar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
