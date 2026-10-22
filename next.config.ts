import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['pdfjs-dist'],
  experimental: { cpus: 1, useTypeScriptCli: false, webpackBuildWorker: false },
};
export default config;
