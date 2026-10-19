import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// Neon "uspava" bazu kad miruje; prvi upit posle toga zna da padne sa
// "Can't reach database server" dok se baza budi. Te greške (i samo njih)
// ponavljamo jednom, posle kratke pauze.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const RETRY_DELAY_MS = 750;

export function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(error.code);
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  delayMs = RETRY_DELAY_MS,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    console.warn("[db] transient error, retrying once", {
      error: error instanceof Error ? error.message : String(error),
    });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fn();
  }
}

// Odgovor za neočekivanu grešku baze u API ruti: 503 za prolazne greške
// konekcije (klijent može da pokuša ponovo), inače 500 bez detalja.
export function dbErrorResponse(error: unknown, context: string) {
  const transient = isTransientDbError(error);
  console.error(`[${context}] database error`, {
    transient,
    code: (error as { code?: string })?.code,
    error: error instanceof Error ? error.message : String(error),
  });
  return transient
    ? NextResponse.json({ error: "Servis je trenutno nedostupan. Pokušaj ponovo." }, { status: 503 })
    : NextResponse.json({ error: "Došlo je do greške na serveru." }, { status: 500 });
}
