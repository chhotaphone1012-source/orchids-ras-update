import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const playSound = (url: string, volume: number = 0.5) => {
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(e => console.warn("Audio play blocked or failed:", e));
  } catch (e) {
    console.error("Audio initialization failed:", e);
  }
};
