import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['pdfjs-dist'],
  outputFileTracingIncludes: {
    '/api/compare': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
    '/api/documents/validate': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
  experimental: { cpus: 1, useTypeScriptCli: false, webpackBuildWorker: false },
};
export default config;
