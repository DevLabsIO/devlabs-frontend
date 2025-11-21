import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    prettierConfig,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        ignores: [
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
            "node_modules/**",
            "dist/**",
            ".turbo/**",
            "coverage/**",
            "unlighthouse-testing/.unlighthouse/**",
        ],
    },
]);

export default eslintConfig;
