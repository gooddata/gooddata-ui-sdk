const depRuiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depRuiser.DefaultRules,
        ...depRuiser.DefaultSdkRules,
        depRuiser.isolatedSubmodule("chart-interfaces", "src/interfaces"),
        depRuiser.moduleWithDependencies("highcharts", "src/highcharts", ["src/interfaces"]),
        depRuiser.moduleWithDependencies("charts", "src/charts", ["src/highcharts", "src/interfaces"]),
    ],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
