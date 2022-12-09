module.exports = {
    paths: ["./src/presentation/localization/bundles"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    debug: false,
    source: "src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/.+/],
        },
    ],
};
