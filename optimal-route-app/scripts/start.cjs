process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
require('react-scripts/config/env');

const WebpackDevServer = require('webpack-dev-server');
const configPath = require.resolve('react-scripts/config/webpackDevServer.config');
const createConfig = require(configPath);
const paths = require('react-scripts/config/paths');
const redirect = require('react-dev-utils/redirectServedPathMiddleware');
const noopWorker = require('react-dev-utils/noopServiceWorkerMiddleware');

// Adapt CRA's removed v4 hooks while retaining proxy/source-map middleware order.
require.cache[configPath].exports = (proxy, allowedHost) => {
  const { https, onBeforeSetupMiddleware, onAfterSetupMiddleware, ...config } =
    createConfig(proxy, allowedHost);
  config.server = https
    ? { type: 'https', options: https === true ? {} : https }
    : 'http';
  config.devMiddleware.publicPath = paths.publicUrlOrPath;
  if (process.env.DANGEROUSLY_DISABLE_HOST_CHECK !== 'true') {
    config.allowedHosts = 'auto';
  }
  delete config.headers['Access-Control-Allow-Origin'];
  config.setupMiddlewares = (middlewares, server) => {
    onBeforeSetupMiddleware(server);
    return [
      ...middlewares,
      { name: 'cra-served-path', middleware: redirect(paths.publicUrlOrPath) },
      { name: 'cra-noop-worker', middleware: noopWorker(paths.publicUrlOrPath) },
    ];
  };
  return config;
};

WebpackDevServer.prototype.close = function (callback) {
  this.stopCallback(callback || (() => {}));
};
require('react-scripts/scripts/start');
