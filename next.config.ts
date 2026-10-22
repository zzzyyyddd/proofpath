import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 1, useTypeScriptCli: false, webpackBuildWorker: false },
};
export default config;
