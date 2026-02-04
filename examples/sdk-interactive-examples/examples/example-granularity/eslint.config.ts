// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/esm-react";

export default [
    ...config,
    {
        rules: {
            "import-x/no-unassigned-import": "warn",
        },
    },
];
