
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/front/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/front"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 7216, hash: '86febef9ddd1fa0a5bc77ea0c0a169e64ca3870645d441c56ad282873573cbe1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1000, hash: '4beda1f2bbaf477cef46f6cb20ec9d65302d7443115395af6ec12d988b9dae7e', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 24982, hash: '7ae894d97f49a339cba58cdae75cfe3f50bc646de3966d087fdef97971a38eaf', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-RMJIFGOD.css': {size: 26072, hash: 'FmBtvPZwQzc', text: () => import('./assets-chunks/styles-RMJIFGOD_css.mjs').then(m => m.default)}
  },
};
