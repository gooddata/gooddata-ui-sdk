// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const reactHooksPlugin: IPackage = {
    name: "eslint-plugin-react-hooks",
    version: "5.2.0",
};

const commonConfiguration = {
    packages: [reactHooksPlugin],
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "error",
    },
};

const v9 = {
    ...commonConfiguration,
    plugins: { "react-hooks": reactHooksPlugin },
};

export const reactHooks: IDualConfiguration<"react-hooks"> = {
    v8: {
        ...commonConfiguration,
        plugins: ["react-hooks"],
    },
    v9,
    ox: v9,
};
