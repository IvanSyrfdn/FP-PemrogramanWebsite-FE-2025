// src/store/useCrosswordProgress.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CrosswordProgressPayload = {
  userId?: string | null;
  puzzleId: string;
  startTime: number; // epoch ms
  endTime?: number | null; // epoch ms
  durationMs?: number | null;
  correctAnswers: number;
  wrongAttempts: number;
  hintUsed: number;
  // any extra meta (level, difficulty, etc.)
  meta?: Record<string, any> | null;
};

type State = {
  // stored values
  puzzleId: string | null;
  startTime: number | null;
  endTime: number | null;
  correctAnswers: number;
  wrongAttempts: number;
  hintUsed: number;
  meta: Record<string, any> | null;

  // derived helpers
  getDurationMs: () => number | null;

  // actions
  startGame: (puzzleId: string, meta?: Record<string, any> | null) => void;
  submitCorrect: (count?: number) => void;
  submitWrong: (count?: number) => void;
  useHint: (count?: number) => void;
  finishGame: () => void;
  reset: () => void;

  // export snapshot for server
  toPayload: (userId?: string | null) => CrosswordProgressPayload | null;
};

export const useCrosswordProgress = create<State>()(
  persist(
    (set, get) => ({
      puzzleId: null,
      startTime: null,
      endTime: null,
      correctAnswers: 0,
      wrongAttempts: 0,
      hintUsed: 0,
      meta: null,

      getDurationMs: () => {
        const s = get().startTime;
        const e = get().endTime;
        if (!s) return null;
        return (e ?? Date.now()) - s;
      },

      startGame: (puzzleId, meta = null) =>
        set({
          puzzleId,
          startTime: Date.now(),
          endTime: null,
          correctAnswers: 0,
          wrongAttempts: 0,
          hintUsed: 0,
          meta,
        }),

      submitCorrect: (count = 1) =>
        set((state) => ({ correctAnswers: state.correctAnswers + count })),

      submitWrong: (count = 1) =>
        set((state) => ({ wrongAttempts: state.wrongAttempts + count })),

      useHint: (count = 1) =>
        set((state) => ({ hintUsed: state.hintUsed + count })),

      finishGame: () =>
        set((state) => ({ endTime: Date.now() })),

      reset: () =>
        set({
          puzzleId: null,
          startTime: null,
          endTime: null,
          correctAnswers: 0,
          wrongAttempts: 0,
          hintUsed: 0,
          meta: null,
        }),

      toPayload: (userId = null) => {
        const s = get();
        if (!s.puzzleId || !s.startTime) return null;
        const end = s.endTime ?? Date.now();
        return {
          userId,
          puzzleId: s.puzzleId,
          startTime: s.startTime,
          endTime: end,
          durationMs: end - s.startTime,
          correctAnswers: s.correctAnswers,
          wrongAttempts: s.wrongAttempts,
          hintUsed: s.hintUsed,
          meta: s.meta ?? null,
        };
      },
    }),
    {
      name: "crossword-progress-storage", // localStorage key
      partialize: (state) => ({
        puzzleId: state.puzzleId,
        startTime: state.startTime,
        endTime: state.endTime,
        correctAnswers: state.correctAnswers,
        wrongAttempts: state.wrongAttempts,
        hintUsed: state.hintUsed,
        meta: state.meta,
      }),
    }
  )
);
