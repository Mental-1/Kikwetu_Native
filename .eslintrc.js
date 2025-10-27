module.exports = {
  root: true,
  extends: ["expo", "plugin:react-hooks/recommended", "prettier"],
  plugins: ["prettier", "react-hooks"],
  rules: {
    "prettier/prettier": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
};