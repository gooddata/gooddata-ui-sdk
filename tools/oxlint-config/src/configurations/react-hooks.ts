// (C) 2026 GoodData Corporation

import { reactHooksRules } from "@gooddata/lint-config";

import { type IConfiguration } from "../types.js";

export const reactHooks: IConfiguration<"react-hooks"> = {
    plugins: ["react-hooks"],
    rules: reactHooksRules,
};
