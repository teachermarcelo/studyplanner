import React from 'react';
import { LessonChallenge } from './types';
import ReadingChallenge from './challenges/ReadingChallenge';
import ListeningChallenge from './challenges/ListeningChallenge';
import SpeakingChallenge from './challenges/SpeakingChallenge';
import WritingChallenge from './challenges/WritingChallenge';

type Props = {
  challenge: LessonChallenge;
  onComplete: () => void;
  isCompleted: boolean;
};

export default function ChallengeRenderer({ challenge, onComplete, isCompleted }: Props) {
  switch (challenge.type) {
    case 'reading':
      return (
        <ReadingChallenge
          challenge={challenge}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'listening':
      return (
        <ListeningChallenge
          challenge={challenge}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'speaking':
      return (
        <SpeakingChallenge
          challenge={challenge}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    case 'writing':
      return (
        <WritingChallenge
          challenge={challenge}
          onComplete={onComplete}
          isCompleted={isCompleted}
        />
      );

    default:
      return null;
  }
}
