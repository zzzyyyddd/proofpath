import { comparisonResultSchema, type ComparisonResult } from '../shared/contracts';

export const STAGES = ['Validating and extracting document text', 'Comparing requirements', 'Checking source evidence', 'Preparing findings'];
export async function consumeComparisonStream(
  response: Response, attemptId: string,
  options: { isCurrent: () => boolean; onStage: (name: string, status: 'started' | 'done') => void },
): Promise<ComparisonResult | null> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The comparison stream was empty.');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let buffer = '', bytes = 0, terminal = false, result: ComparisonResult | null = null;
  let stageIndex = 0, stageStarted = false;
  try {
    while (true) {
      const next = await reader.read();
      if (!options.isCurrent()) return null;
      if (next.done) { buffer += decoder.decode(); break; }
      bytes += next.value.byteLength;
      if (bytes > 1_000_000) throw new Error('The comparison stream exceeded its supported budget. No output was truncated.');
      buffer += decoder.decode(next.value, { stream: true });
      while (buffer.includes('\n')) {
        const boundary = buffer.indexOf('\n'), line = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 1);
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        if (!event || event.attemptId !== attemptId || terminal) throw new Error('The comparison returned an inconsistent stream.');
        if (event.type === 'stage' && event.name === STAGES[stageIndex]) {
          if (event.status === 'started' && !stageStarted) stageStarted = true;
          else if (event.status === 'done' && stageStarted) { stageStarted = false; stageIndex++; }
          else throw new Error('The processing stages were inconsistent.');
          options.onStage(event.name, event.status);
        } else if (event.type === 'result') {
          if (stageIndex !== STAGES.length || stageStarted) throw new Error('Results arrived before the processing stages finished.');
          result = comparisonResultSchema.parse(event.result);
          if (result.attemptId !== attemptId) throw new Error('The comparison attempt did not match.');
          terminal = true;
        } else if (event.type === 'error' && typeof event.error?.message === 'string') throw new Error(event.error.message);
        else throw new Error('The comparison returned an unsupported event.');
      }
    }
    if (!terminal || buffer.trim()) throw new Error('The comparison stream was interrupted. No completed analysis was received.');
    return result;
  } finally { await reader.cancel().catch(() => undefined); }
}
