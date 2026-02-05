// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm";

export default [
    ...config,
    {
        rules: {
            "import-x/export": "warn",
        },
    },
];
