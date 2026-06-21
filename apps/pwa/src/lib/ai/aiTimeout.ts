import type { AvailabilityKind } from './languageModel.js';

const DEFAULT_MS = 15_000;

export async function withTimeoutKind(
  promise: Promise<AvailabilityKind>,
  ms = DEFAULT_MS,
): Promise<{ kind: AvailabilityKind; timedOut: boolean }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise.then((kind) => ({ kind, timedOut: false as const })),
      new Promise<{ kind: AvailabilityKind; timedOut: boolean }>((resolve) => {
        timer = setTimeout(() => resolve({ kind: 'unavailable', timedOut: true }), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
