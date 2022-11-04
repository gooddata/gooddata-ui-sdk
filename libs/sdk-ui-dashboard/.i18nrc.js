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
        // some messages are used from redux and so the react intl cannot detect then
        {
            dir: /src\/presentation\/localization\/bundles/,
            pattern: /^(messages\.dashboard\..+)$/,
            ignore: true,
        },
    ],
};
