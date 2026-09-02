// (C) 2025-2026 GoodData Corporation

import { IPackage, Rules } from "../types.js";

export const testingLibraryPlugin: IPackage = {
    name: "eslint-plugin-testing-library",
    version: "7.16.2",
};

const commonRules: Rules<"testing-library"> = {
    "testing-library/await-async-queries": "error",
    "testing-library/await-async-utils": "error",
    "testing-library/no-await-sync-queries": "error",
    "testing-library/no-global-regexp-flag-in-query": "error",
    "testing-library/no-node-access": "error",
    "testing-library/no-promise-in-fire-event": "error",
    "testing-library/no-wait-for-multiple-assertions": "error",
    "testing-library/no-wait-for-side-effects": "error",
    "testing-library/no-wait-for-snapshot": "error",
    "testing-library/prefer-find-by": "error",
    "testing-library/prefer-presence-queries": "error",
    "testing-library/prefer-query-by-disappearance": "error",
    "testing-library/prefer-screen-queries": "error",
};

export const testingLibraryDomRules: Rules<"testing-library"> = {
    ...commonRules,
    "testing-library/await-async-events": [
        "error",
        {
            eventModule: "userEvent",
        },
    ],
    "testing-library/no-await-sync-events": [
        "error",
        {
            eventModules: ["fire-event"],
        },
    ],
};

export const testingLibraryReactRules: Rules<"testing-library"> = {
    ...commonRules,
    "testing-library/await-async-events": [
        "error",
        {
            eventModule: "userEvent",
        },
    ],
    "testing-library/no-await-sync-events": [
        "error",
        {
            eventModules: ["fire-event"],
        },
    ],
    "testing-library/no-container": "error",
    "testing-library/no-debugging-utils": "warn",
    "testing-library/no-dom-import": ["error", "react"],
    "testing-library/no-manual-cleanup": "error",
    "testing-library/no-render-in-lifecycle": "error",
    "testing-library/no-unnecessary-act": "error",
    "testing-library/render-result-naming-convention": "error",
};

export const testingLibraryVueRules: Rules<"testing-library"> = {
    ...commonRules,
    "testing-library/await-async-events": [
        "error",
        {
            eventModule: ["fireEvent", "userEvent"],
        },
    ],
    "testing-library/no-container": "error",
    "testing-library/no-debugging-utils": "warn",
    "testing-library/no-dom-import": ["error", "vue"],
    "testing-library/no-manual-cleanup": "error",
    "testing-library/no-render-in-lifecycle": "error",
    "testing-library/render-result-naming-convention": "error",
};
