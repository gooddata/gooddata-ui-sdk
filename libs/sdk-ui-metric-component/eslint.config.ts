// (C) 2020-2026 GoodData Corporation

import config from "@gooddata/eslint-config/oxlint-esm-react-vitest";

export default [
    ...config,
    {
        // bundled Monaco editor worker produced by the build-worker script
        ignores: ["worker/**"],
    },
    {
        rules: {
            "react/jsx-no-leaked-render": "off",
        },
    },
];
