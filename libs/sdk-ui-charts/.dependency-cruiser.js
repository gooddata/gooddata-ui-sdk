const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depCruiser.DefaultRules,
        ...depCruiser.DefaultSdkRules,
        depCruiser.isolatedSubmodule("chart-interfaces", "src/interfaces"),
        depCruiser.moduleWithDependencies("highcharts", "src/highcharts", ["src/interfaces"]),
        depCruiser.moduleWithDependencies("charts", "src/charts", ["src/highcharts", "src/interfaces"]),
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
