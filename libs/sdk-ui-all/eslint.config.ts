// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm";

export default [
    ...config,
    {
        rules: {
            "import-x/export": "warn",
        },
    },
];
