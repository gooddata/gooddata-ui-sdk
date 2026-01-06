// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vite";

// eslint-disable-next-line no-restricted-exports
export default defineConfig({
    plugins: [
        {
            name: "mock-css-modules",
            enforce: "pre",
            transform(_code, id) {
                if (id.match(/\.module\.(?:css|scss)$/)) {
                    return { code: "export default {};", map: null };
                }

                return undefined;
            },
        },
    ],
});
