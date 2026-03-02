module.exports = {
  root: true,
  extends: [require.resolve("@cowri/config/eslint/nestjs")],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
