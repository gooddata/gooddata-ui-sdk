// (C) 2021-2024 GoodData Corporation

module.exports = {
    paths: ["./src/fixtures/"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    comments: true,
    debug: true,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/^text\./, /^properly\./],
        },
    ],
};
