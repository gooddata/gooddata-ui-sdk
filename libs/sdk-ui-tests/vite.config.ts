// (C) 2023-2025 GoodData Corporation
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        {
            name: "mock-css-modules",
            enforce: "pre",
            transform(code, id) {
                if (id.match(/\.module\.(css|scss)$/)) {
                    return { code: "export default {};", map: null };
                }
            },
        },
    ],
});
