// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";

export default [
    ...config,
    {
        rules: {
            "react/jsx-no-leaked-render": "off",
        },
    },
];
