// (C) 2026 GoodData Corporation

import { type IConfiguration } from "../types.js";

export const oxc: IConfiguration<"oxc"> = {
    plugins: ["oxc"],
    rules: {
        "oxc/only-used-in-recursion": "off",
    },
};
