import { type ClassValue, clsx } from "clsx";
import type { HashOptions } from "crypto";
import { twMerge } from "tailwind-merge";

const secret_key = process.env.SECRET_KEY as HashOptions;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function AddMinutesToDate({
  date = new Date(),
  minutes,
}: {
  date: any;
  minutes: number;
}) {
  return new Date(date.getTime() + minutes * 60000);
}

// export async function CreateHash(key: string) {
//   return await bcrypt.hash(pass, 10);
// }

// export async function ComparePasswords(candidatePass: string, pass: string) {
//   return await bcrypt.compare(candidatePass, pass);
// }
