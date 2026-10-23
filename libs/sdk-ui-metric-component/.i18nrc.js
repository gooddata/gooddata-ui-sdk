// (C) 2025-2026 GoodData Corporation

export default {
    paths: ["./src/translations"],
    structure: true,
    comments: true,
    intl: true,
    html: true,
    usage: true,
    debug: false,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/.+/],
        },
    ],
};
