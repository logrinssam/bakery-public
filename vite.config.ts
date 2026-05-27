import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execSync} from 'child_process';
import path from 'path';
import obfuscator from 'rollup-plugin-obfuscator';
import {defineConfig, type Plugin} from 'vite';

function resolveBuildId(): string {
  try {
    const sha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    if (sha) return sha;
  } catch {
    // not a git repo or git unavailable
  }
  return String(Date.now());
}

function makeVersionCheckScript(buildId: string, base: string): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  const updateMsg =
    '픽셀 베이커리 업데이트!\n\n' +
    '확인을 누르면 새로고침해 주세요.\n' +
    '공부한 진행은 사라지지 않아요.\n' +
    '(엔터 버그로 단계만 튄 경우 맞춰 드려요)';
  const ackKey = 'pixel_bakery_update_ack_v1';
  return `(function(){var B=${JSON.stringify(buildId)};var R=${JSON.stringify(root)};var MSG=${JSON.stringify(updateMsg)};var AK=${JSON.stringify(ackKey)};function ck(){fetch(R+"version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){if(!d||!d.id||d.id===B)return;try{if(sessionStorage.getItem(AK)===d.id)return}catch(e){}try{sessionStorage.setItem(AK,d.id)}catch(e){}try{alert(MSG)}catch(e){}location.reload()}).catch(function(){})}ck();setInterval(ck,3e4);document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")ck()})})();`;
}

/** dist/version.json + version-check.js + 번들에 동일 ID 주입 */
function appVersionPlugin(buildId: string, base: string): Plugin {
  const versionCheckJs = makeVersionCheckScript(buildId, base);

  return {
    name: 'app-version',
    config() {
      return {
        define: {
          __APP_BUILD_ID__: JSON.stringify(buildId),
        },
      };
    },
    transformIndexHtml(html) {
      const tag = `<script src="${base}version-check.js"></script>`;
      if (html.includes('version-check.js')) return html;
      return html.replace(
        '<script type="module"',
        `${tag}\n    <script type="module"`
      );
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({
          id: buildId,
          builtAt: new Date().toISOString(),
        }),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'version-check.js',
        source: versionCheckJs,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? '';
        if (path.endsWith('/version-check.js') || path === '/version-check.js') {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(versionCheckJs);
          return;
        }
        next();
      });
    },
  };
}

const DEFAULT_PUBLIC_APP_URL = 'https://pixel-bakery.xn--9d0blmm1xg2knrf.com';

function publicAppUrlPlugin(): Plugin {
  const base = (
    process.env.VITE_PUBLIC_APP_URL?.trim() || DEFAULT_PUBLIC_APP_URL
  ).replace(/\/$/, '');
  return {
    name: 'public-app-url',
    transformIndexHtml(html) {
      return html.replaceAll('__PUBLIC_APP_URL__', base);
    },
  };
}

export default defineConfig(({mode}) => {
  const production = mode === 'production';
  const githubPages = process.env.GITHUB_PAGES === 'true';
  const buildId = resolveBuildId();
  const appBase = githubPages ? '/bakery-public/' : '/';

  return {
    // GitHub Pages는 /<repo>/ 서브패스로 서빙됨
    base: appBase,
    plugins: [appVersionPlugin(buildId, appBase), publicAppUrlPlugin(), react(), tailwindcss()],
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
