module.exports = {
  root: true,
  extends: [require.resolve("@cowri/config/eslint/nextjs")],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
