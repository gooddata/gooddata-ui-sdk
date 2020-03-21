const depRuiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        ...depRuiser.DefaultRules,
        ...depRuiser.DefaultSdkRules,
        depRuiser.isolatedSubmodule("highcharts", "src/highcharts"),
        depRuiser.moduleWithDependencies("charts", "src/charts", ["src/highcharts"]),
    ],
    options: depRuiser.DefaultOptions,
};

module.exports = options;
