const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        ...depCruiser.PublicLibraryRules,
        depCruiser.isolatedSubmodule("chart-interfaces", "src/interfaces"),
        depCruiser.moduleWithDependencies("highcharts", "src/highcharts", ["src/interfaces"]),
        depCruiser.moduleWithDependencies("charts", "src/charts", ["src/highcharts", "src/interfaces"]),
        /* These appear as desired deps for the two modules; currently there are validation errors. The
         * refactoring should by driven by need to remove these validation errors.
        depCruiser.moduleWithDependencies(
            "chart-options-builder",
            "src/highcharts/chartTypes/_chartOptions",
            [
                "src/highcharts/chartTypes/_util/*",
                "src/interfaces",
                "src/highcharts/typings/*",
                "src/highcharts/constants/*",
                "src/highcharts/lib",
            ],
        ),
        depCruiser.moduleWithDependencies("chart-creators", "src/highcharts/chartTypes/_chartCreators", [
            "src/highcharts/chartTypes/_util/*",
            "src/interfaces",
            "src/highcharts/typings/*",
            "src/highcharts/constants/*",
            "src/highcharts/lib",
        ]),*/
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
