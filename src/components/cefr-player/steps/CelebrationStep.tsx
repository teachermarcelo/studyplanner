import React from 'react';
import { PartyPopper, Trophy, CalendarDays, ArrowRight } from 'lucide-react';
import { CelebrationStepData } from '../types';

type Props = {
  step: CelebrationStepData;
};

export default function CelebrationStep({ step }: Props) {
  return (
    <div className="h-full rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm overflow-hidden flex items-center justify-center">
      <div className="max-w-2xl text-center px-8">
        <div className="mx-auto w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-6">
          <PartyPopper size={34} />
        </div>

        <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70">Daily win</p>
        <h2 className="text-4xl md:text-5xl font-black mt-3">{step.title}</h2>
        <p className="mt-5 text-xl text-white/90">{step.message}</p>
        <p className="mt-4 text-white/80 leading-8">{step.encouragement}</p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
            <div className="inline-flex items-center gap-2 font-bold">
              <Trophy size={18} />
              +{step.xpEarned} XP
            </div>
            <p className="text-sm text-white/75 mt-2">You finished the day and earned progress.</p>
          </div>

          <div className="rounded-3xl bg-white/10 border border-white/15 p-5">
            <div className="inline-flex items-center gap-2 font-bold">
              <CalendarDays size={18} />
              Keep coming back
            </div>
            <p className="text-sm text-white/75 mt-2">Short daily sessions create stronger consistency.</p>
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white text-indigo-700 px-6 py-4 font-black">
          Continue tomorrow
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  );
}
