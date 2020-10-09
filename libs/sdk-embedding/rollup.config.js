// (C) 2020 GoodData Corporation
import typescript from "rollup-plugin-typescript2";

export default {
    input: { index: "src/index.ts", internal: "src/internal/index.ts" },
    output: [
        {
            dir: "dist/cjs",
            format: "cjs",
        },
        {
            dir: "dist/esm",
            format: "esm",
        },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.build.json" })],
    external: [
        "@gooddata/api-model-bear",
        "lodash/get",
        "lodash/isEmpty",
        "lodash/isNumber",
        "lodash/isObject",
        "lodash/isString",
    ],
};
