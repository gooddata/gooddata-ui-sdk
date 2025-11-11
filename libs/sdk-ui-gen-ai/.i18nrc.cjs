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
        {
            pattern: [/.+/],
        },
        // some messages are used from kit components so the validator does not "see" them
        {
            dir: /src\/localization\/bundles/,
            pattern: /^(gs\.date\.(today|tomorrow|yesterday))$/,
            ignore: true,
        },
        {
            dir: /src\/localization\/bundles/,
            pattern: /^(drill\.)/,
            ignore: true,
        },
    ],
};
