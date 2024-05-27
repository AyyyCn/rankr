module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: '@storybook/react',
  core: {
    builder: 'storybook-builder-vite',
  },
  viteFinal: async (config, { configType }) => {
   
    return {
      ...config,
      css: {
        modules: {
          localsConvention: 'camelCaseOnly',
        },
      },
    };
  },
};
