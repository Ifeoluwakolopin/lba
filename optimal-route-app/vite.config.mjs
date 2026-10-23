import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { X509Certificate } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';
import browserTargets from 'browserslist-to-esbuild';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { generate } from 'selfsigned';

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

async function developmentHttps(env) {
  if (env.HTTPS !== 'true') return undefined;
  if (env.SSL_CRT_FILE && env.SSL_KEY_FILE) {
    return {
      cert: readFileSync(resolve(root, env.SSL_CRT_FILE)),
      key: readFileSync(resolve(root, env.SSL_KEY_FILE)),
    };
  }
  const cache = resolve(root, 'node_modules/.cache/vite/dev-certificate.json');
  try {
    const certificate = JSON.parse(await readFile(cache, 'utf8'));
    if (new Date(new X509Certificate(certificate.cert).validTo) > new Date()) return certificate;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const pem = await generate([{ name: 'commonName', value: 'localhost' }], {
    keySize: 2048, algorithm: 'sha256',
    notAfterDate: new Date(Date.now() + 30 * 86400000),
    extensions: [{ name: 'subjectAltName', altNames: [
      { type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, { type: 7, ip: '::1' },
    ] }],
  });
  const certificate = { key: pem.private, cert: pem.cert };
  await mkdir(dirname(cache), { recursive: true });
  await writeFile(cache, JSON.stringify(certificate), { mode: 0o600 });
  return certificate;
}

export default defineConfig(async ({ mode, command }) => {
  const env = { ...loadEnv(mode, root, ''), ...process.env };
  const publicEnv = Object.fromEntries(Object.entries(env).filter(([key]) => key.startsWith('REACT_APP_')));
  const configuredBase = env.PUBLIC_URL || pkg.homepage || '/';
  const base = configuredBase === '.' ? './' : configuredBase.replace(/\/?$/, '/');
  const publicUrl = base.replace(/\/$/, '');
  const publicPath = base === './' ? '/' : base.startsWith('http') ? new URL(base).pathname : base;
  const browserQuery = pkg.browserslist[mode === 'development' ? 'development' : 'production'];
  const target = browserTargets(browserQuery);
  const proxy = pkg.proxy ? {
    '^/(?!@|src/|node_modules/)': {
      target: pkg.proxy, changeOrigin: true, ws: true,
      bypass(request) {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (request.headers.accept?.includes('text/html') || existsSync(resolve(root, 'public', pathname.slice(1)))) return request.url;
      },
    },
  } : undefined;
  return {
    base,
    envPrefix: 'REACT_APP_',
    define: { 'process.env': JSON.stringify({ ...publicEnv, NODE_ENV: mode === 'test' ? 'test' : command === 'build' ? 'production' : 'development', PUBLIC_URL: publicUrl }) },
    plugins: [
      {
        name: 'existing-jsx-and-cra-public-contract',
        enforce: 'pre',
        transform(code, id) {
          if (id.startsWith(resolve(root, 'src') + '/') && id.split('?')[0].endsWith('.js')) {
            return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' }, sourcemap: true });
          }
        },
        transformIndexHtml(html) {
          const values = { ...publicEnv, PUBLIC_URL: publicUrl };
          return html.replace(/%([A-Z0-9_]+)%/g, (match, key) => values[key] ?? match);
        },
        configureServer(server) {
          server.middlewares.use((request, response, next) => {
            if (request.url?.split('?')[0] !== `${publicPath}service-worker.js`) return next();
            response.setHeader('Content-Type', 'application/javascript');
            response.end("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',event=>event.waitUntil(self.registration.unregister().then(()=>self.clients.matchAll()).then(clients=>clients.forEach(client=>client.navigate(client.url)))));");
          });
        },
      },
      react(),
    ],
    optimizeDeps: { rolldownOptions: { moduleTypes: { '.js': 'jsx' } } },
    css: { transformer: 'lightningcss', lightningcss: { targets: browserslistToTargets(browserslist(browserQuery)) } },
    server: {
      host: env.HOST || '0.0.0.0',
      port: Number(env.PORT || 3000),
      open: env.BROWSER !== 'none' && !env.CI,
      allowedHosts: env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true' ? true : undefined,
      https: command === 'serve' ? await developmentHttps(env) : undefined,
      proxy,
      hmr: { host: env.WDS_SOCKET_HOST || undefined, clientPort: env.WDS_SOCKET_PORT ? Number(env.WDS_SOCKET_PORT) : undefined, path: env.WDS_SOCKET_PATH || undefined },
    },
    build: {
      outDir: env.BUILD_PATH || 'build',
      target,
      sourcemap: env.GENERATE_SOURCEMAP !== 'false',
      rolldownOptions: { output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: asset => asset.names?.some(name => name.endsWith('.css')) ? 'static/css/[name]-[hash][extname]' : 'static/media/[name]-[hash][extname]',
      } },
    },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.js'], unstubGlobals: true, coverage: { provider: 'v8' } },
  };
});
