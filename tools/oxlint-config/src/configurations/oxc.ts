// (C) 2026 GoodData Corporation

import { type IConfiguration } from "../types.js";

export const oxc: IConfiguration<"oxc"> = {
    plugins: ["oxc"],
    rules: {
        "oxc/bad-array-method-on-arguments": "error",
        "oxc/bad-char-at-comparison": "error",
        "oxc/bad-comparison-sequence": "error",
        "oxc/bad-min-max-func": "error",
        "oxc/bad-object-literal-comparison": "error",
        "oxc/bad-replace-all-arg": "error",
        "oxc/const-comparisons": "error",
        "oxc/double-comparisons": "error",
        "oxc/erasing-op": "error",
        "oxc/missing-throw": "error",
        "oxc/number-arg-out-of-range": "error",
        // TODO: Enable this rule once existing violations are fixed
        "oxc/only-used-in-recursion": "off",
        "oxc/uninvoked-array-callback": "error",
    },
};
