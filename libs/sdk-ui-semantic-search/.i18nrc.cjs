// (C) 2021-2024 GoodData Corporation

module.exports = {
    paths: ["./src/localization/bundles"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    comments: true,
    debug: false,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/.+/],
        },
    ],
};
