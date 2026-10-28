export default {
  $schema: 'https://json.schemastore.org/prettierrc',
  bracketSpacing: true,
  overrides: [
    {
      files: ['*.md'],
      options: {
        proseWrap: 'always',
        useTabs: false,
      },
    },
  ],
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
};
