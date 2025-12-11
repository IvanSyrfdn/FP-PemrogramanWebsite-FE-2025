// src/api/progress/useSaveProgress.ts
import { useMutation } from "@tanstack/react-query";
import axios from "../axios";

export type SaveProgressRequest = {
  userId?: string | null;
  puzzleId: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  correctAnswers: number;
  wrongAttempts: number;
  hintUsed: number;
  meta?: Record<string, any> | null;
};

export const useSaveProgress = () => {
  return useMutation({
    mutationFn: async (payload: SaveProgressRequest) => {
      const res = await axios.post("/progress/crossword", payload);
      return res.data;
    },
  });
};
