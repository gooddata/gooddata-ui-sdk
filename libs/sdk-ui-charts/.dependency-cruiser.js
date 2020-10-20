const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("chart-interfaces", "src/interfaces"),
        depCruiser.moduleWithDependencies("highcharts", "src/highcharts", ["src/interfaces"]),
        depCruiser.moduleWithDependencies("charts", "src/charts", ["src/highcharts", "src/interfaces"]),
        depCruiser.moduleWithDependencies(
            "chart-options-builder",
            "src/highcharts/chartTypes/_chartOptions",
            [
                "src/highcharts/chartTypes/_util/*",
                "src/interfaces",
                "src/highcharts/typings/*",
                "src/highcharts/constants/*",
            ],
        ),
        depCruiser.moduleWithDependencies("chart-creators", "src/highcharts/chartTypes/_chartCreators", [
            "src/highcharts/chartTypes/_util/*",
            "src/interfaces",
            "src/highcharts/typings/*",
            "src/highcharts/constants/*",
        ]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
