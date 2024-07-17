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
        /**
         * These ignored messages are used in the attribute filter implementation for dashboard component, so we need to have these messages
         * here even though they are used within the sdk-ui-dashboard code.
         */
        {
            dir: /src\/base\/localization\/bundles/,
            pattern:
                /^(attributesDropdown.filterConfiguredMessage|attributesDropdown.noConnectionMessage|attributesDropdown.attributeNameWithData)$/,
            ignore: true,
        },
    ],
};
