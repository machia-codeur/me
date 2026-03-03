module.exports = {
  extends: [require.resolve("@cowri/config/eslint/nestjs")],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
