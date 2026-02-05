// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react";

export default [
    ...config,
    {
        rules: {
            "import-x/no-unassigned-import": "warn",
        },
    },
];
