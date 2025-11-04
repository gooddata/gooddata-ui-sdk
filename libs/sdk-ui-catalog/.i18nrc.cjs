// (C) 2021-2025 GoodData Corporation

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
        // validate only this package's own keys
        {
            pattern: [/^(?!(gs)).*/],
            filterTranslationFile: true,
        },
        // ignore global keys coming from external SDK translations (e.g., gs.*)
        {
            pattern: [/^gs\./],
            filterTranslationFile: true,
            ignore: true,
        },
    ],
};
