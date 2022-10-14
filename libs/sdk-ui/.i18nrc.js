module.exports = {
    paths: ["./src/base/localization/bundles"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    debug: false,
    source: "../{sdk-ui,sdk-ui-charts,sdk-ui-pivot,sdk-ui-kit,sdk-ui-filters,sdk-ui-vis-commons,sdk-ui-geo}/src/**/*.{ts,js,tsx,jsx}",
    rules: [
        {
            pattern: [/.+/],
        },
        // some messages need to be included for the sake of older dashboard plugins
        {
            dir: /src\/base\/localization\/bundles/,
            pattern: /^(gs.filter.loading|attrf.all|attrf.all_except|attributeFilterDropdown.emptyValue)$/,
            ignore: true,
        },
    ],
};
