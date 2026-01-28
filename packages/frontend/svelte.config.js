import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: '../backend/media',
      assets: '../backend/media',
      strict: false,
    }),
    prerender: {
      handleUnseenRoutes: 'ignore',
    },
    paths: {
      relative: false,
    },
    output: {
      bundleStrategy: 'inline',
    },
  },
};

export default config;
