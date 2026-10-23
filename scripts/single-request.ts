// The one-shot probe cannot follow redirects or issue a second fetch, even if
// a future adapter accidentally adds retry logic. No network call occurs here.
export function validateProbeArgs(args: string[]): string {
  if (args.filter(arg => arg === '--confirm-free-plan').length !== 1
    || args.filter(arg => arg === '--max-calls=1').length !== 1
    || args.filter(arg => arg.startsWith('--fixture=')).length > 1
    || args.some(arg => !['--confirm-free-plan', '--max-calls=1'].includes(arg) && !/^--fixture=[a-z]+$/.test(arg))) {
    throw new Error('Expected one explicit free-plan confirmation, exactly --max-calls=1, and at most one fixture. No inference performed.');
  }
  return args.find(arg => arg.startsWith('--fixture='))?.slice('--fixture='.length) ?? 'main';
}

export function singleRequest(fetcher: typeof fetch = fetch) {
  let requests = 0;
  let httpStatus: number | null = null;
  let signal: AbortSignal | null = null;
  return {
    get requests() { return requests; },
    get httpStatus() { return httpStatus; },
    get signalAborted() { return signal?.aborted ?? false; },
    get abortReason() {
      if (!signal?.aborted) return null;
      // Never expose arbitrary abort reasons, errors, credentials or document text.
      const name: unknown = signal.reason?.name;
      return name === 'TimeoutError' || name === 'AbortError' ? name : 'Other';
    },
    fetcher: (async (url, options) => {
      if (requests >= 1) throw new Error('One-request evaluation budget exhausted.');
      requests++;
      signal = options?.signal ?? null;
      const response = await fetcher(url, { ...options, redirect: 'error' });
      httpStatus = response.status;
      return response;
    }) as typeof fetch,
  };
}
