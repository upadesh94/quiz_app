import React from 'react';
import { Text } from 'react-native';

type TimerProps = {
  secondsRemaining: number;
};

export function Timer({ secondsRemaining }: TimerProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  return <Text>{`Time Left: ${minutes}:${String(seconds).padStart(2, '0')}`}</Text>;
}
