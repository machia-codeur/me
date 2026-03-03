module.exports = {
  extends: [require.resolve("@cowri/config/eslint/next")],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
