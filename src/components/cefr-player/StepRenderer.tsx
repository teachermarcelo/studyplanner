import React from 'react';
import { LessonStep } from './types';
import ReadingStep from './steps/ReadingStep';
import ListeningStep from './steps/ListeningStep';
import SpeakingStep from './steps/SpeakingStep';
import WritingStep from './steps/WritingStep';
import CelebrationStep from './steps/CelebrationStep';

type Props = {
  step: LessonStep;
  onNext: () => void;
};

export default function StepRenderer({ step, onNext }: Props) {
  switch (step.type) {
    case 'reading':
      return <ReadingStep step={step} onNext={onNext} />;
    case 'listening':
      return <ListeningStep step={step} onNext={onNext} />;
    case 'speaking':
      return <SpeakingStep step={step} onNext={onNext} />;
    case 'writing':
      return <WritingStep step={step} onNext={onNext} />;
    case 'celebration':
      return <CelebrationStep step={step} />;
    default:
      return null;
  }
}
