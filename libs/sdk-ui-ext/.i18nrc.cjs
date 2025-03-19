module.exports = {
    paths: ["./src/internal/translations"],
    structure: true,
    intl: true,
    html: true,
    insightToReport: true,
    usage: true,
    debug: false,
    source: "../sdk-ui-ext/src/**/*.{ts,js,tsx,jsx}",
    rules: [
        /*
             userManagement was moved here but localization is missing its ok it use by HOME-UI and this app using incorrect intl provider
             so expected localization from sdk-ui
             remove it by solving critical https://gooddata.atlassian.net/browse/STL-702 afraid that it could cause duplication issues.
        */
        {
            pattern: [
                /^userManagement\./,
            ],
            ignore: true,
        },
        {
            pattern: [/.+/],
        }
    ],
};
