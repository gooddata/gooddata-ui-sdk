// (C) 2020 GoodData Corporation
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";

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
    plugins: [commonjs(), typescript({ tsconfig: "./tsconfig.build.json" })],
    external: [
        /internal\/assets/,
        /internal\/translations/,
        "@gooddata/api-model-bear",
        "lodash/get",
        "lodash/isEmpty",
        "lodash/isNumber",
        "lodash/isObject",
        "lodash/isString",
    ],
};
