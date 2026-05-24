import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import obfuscator from 'rollup-plugin-obfuscator';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  const production = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // 배포물에 .map 없음 → F12 Sources에서 TS 원본 복원 불가
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2,
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: production
        ? {
            plugins: [
              obfuscator({
                global: false,
                options: {
                  compact: true,
                  controlFlowFlattening: false,
                  deadCodeInjection: false,
                  debugProtection: false,
                  disableConsoleOutput: true,
                  identifierNamesGenerator: 'hexadecimal',
                  renameGlobals: false,
                  selfDefending: true,
                  stringArray: true,
                  stringArrayEncoding: ['base64'],
                  stringArrayThreshold: 0.75,
                  transformObjectKeys: true,
                  unicodeEscapeSequence: false,
                },
              }),
            ],
          }
        : undefined,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
