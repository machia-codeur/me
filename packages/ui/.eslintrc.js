module.exports = {
  extends: [require.resolve("@cowri/config/eslint/base")],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
