// utils/srs.ts

export interface SM2Result {
  repetition: number
  interval: number
  efactor: number //難易度
}

export function calculateSM2(
  score: number,
  repetition: number,
  interval: number,
  efactor: number
): SM2Result {
  if (score < 3) {
    return {
      repetition: 0,
      interval: 0.0001,
      efactor,
    };
  }

  const newRepetition = repetition + 1;
  let newInterval = 0;

  if (newRepetition === 1) {
    newInterval = 1;
  } else if (newRepetition === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * efactor);
  }

  let newEfactor =
    efactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
  if (newEfactor < 1.3) newEfactor = 1.3;

  return {
    repetition: newRepetition,
    interval: newInterval,
    efactor: newEfactor,
  };
}