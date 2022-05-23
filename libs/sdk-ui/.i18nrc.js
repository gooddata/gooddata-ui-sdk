module.exports = {
    paths: ["./src/base/localization/bundles"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: false,
    debug: false,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/.+/],
        },
    ],
};
