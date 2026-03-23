// (C) 2025-2026 GoodData Corporation

import { IPackage } from "../types.js";

export const playwrightPlugin: IPackage = {
    name: "eslint-plugin-playwright",
    version: "2.10.1",
};

export const playwrightRules = {
    "no-empty-pattern": "off",
    "playwright/consistent-spacing-between-blocks": "warn",
    "playwright/expect-expect": "warn",
    "playwright/max-nested-describe": "warn",
    "playwright/missing-playwright-await": "error",
    "playwright/no-conditional-expect": "warn",
    "playwright/no-conditional-in-test": "warn",
    "playwright/no-duplicate-hooks": "warn",
    "playwright/no-duplicate-slow": "warn",
    "playwright/no-element-handle": "warn",
    "playwright/no-eval": "warn",
    "playwright/no-focused-test": "error",
    "playwright/no-force-option": "warn",
    "playwright/no-nested-step": "warn",
    "playwright/no-networkidle": "error",
    "playwright/no-page-pause": "warn",
    "playwright/no-skipped-test": "warn",
    "playwright/no-standalone-expect": "error",
    "playwright/no-unsafe-references": "error",
    "playwright/no-unused-locators": "error",
    "playwright/no-useless-await": "warn",
    "playwright/no-useless-not": "warn",
    "playwright/no-wait-for-navigation": "error",
    "playwright/no-wait-for-selector": "warn",
    "playwright/no-wait-for-timeout": "warn",
    "playwright/prefer-hooks-in-order": "warn",
    "playwright/prefer-hooks-on-top": "warn",
    "playwright/prefer-locator": "warn",
    "playwright/prefer-to-have-count": "warn",
    "playwright/prefer-to-have-length": "warn",
    "playwright/prefer-web-first-assertions": "error",
    "playwright/valid-describe-callback": "error",
    "playwright/valid-expect": "error",
    "playwright/valid-expect-in-promise": "error",
    "playwright/valid-test-tags": "error",
    "playwright/valid-title": "error",
};
