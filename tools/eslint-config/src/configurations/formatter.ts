// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const commonConfig = {
    rules: {
        curly: 0,
        "no-unexpected-multiline": 0,
        "@typescript-eslint/lines-around-comment": 0,
        "@typescript-eslint/quotes": 0,
        "unicorn/template-indent": 0,

        // The rest are rules that you never need to enable when using Prettier.
        "@typescript-eslint/block-spacing": "off",
        "@typescript-eslint/brace-style": "off",
        "@typescript-eslint/comma-dangle": "off",
        "@typescript-eslint/comma-spacing": "off",
        "@typescript-eslint/func-call-spacing": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/key-spacing": "off",
        "@typescript-eslint/keyword-spacing": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/no-extra-parens": "off",
        "@typescript-eslint/no-extra-semi": "off",
        "@typescript-eslint/object-curly-spacing": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/space-before-blocks": "off",
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/space-infix-ops": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "react/jsx-child-element-spacing": "off",
        "react/jsx-closing-bracket-location": "off",
        "react/jsx-closing-tag-location": "off",
        "react/jsx-curly-newline": "off",
        "react/jsx-curly-spacing": "off",
        "react/jsx-equals-spacing": "off",
        "react/jsx-first-prop-new-line": "off",
        "react/jsx-indent": "off",
        "react/jsx-indent-props": "off",
        "react/jsx-max-props-per-line": "off",
        "react/jsx-newline": "off",
        "react/jsx-one-expression-per-line": "off",
        "react/jsx-props-no-multi-spaces": "off",
        "react/jsx-tag-spacing": "off",
        "react/jsx-wrap-multilines": "off",
        "unicorn/empty-brace-spaces": "off",
        "unicorn/no-nested-ternary": "off",
        "unicorn/number-literal-case": "off",
    },
};

export const formatter: IDualConfiguration = {
    v8: commonConfig,
    v9: commonConfig,
};
