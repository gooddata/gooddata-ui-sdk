// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
    PublicLibraryRules,
    isolatedSubmodule,
    moduleWithDependencies,
} from "../../common/config/dep-cruiser/default.config.js";

// eslint-disable-next-line no-restricted-exports
export default {
    forbidden: [
        ...DefaultRules,
        ...DefaultSdkRules,
        ...PublicLibraryRules,
        isolatedSubmodule("chart-interfaces", "src/interfaces"),
        moduleWithDependencies("highcharts", "src/highcharts", ["src/interfaces/*"]),
        //moduleWithDependencies("charts", "src/charts", ["src/highcharts", "src/interfaces"]),
        /* These appear as desired deps for the two modules; currently there are validation errors. The
         * refactoring should by driven by need to remove these validation errors.
        moduleWithDependencies(
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
        moduleWithDependencies("chart-creators", "src/highcharts/chartTypes/_chartCreators", [
            "src/highcharts/chartTypes/_util/*",
            "src/interfaces",
            "src/highcharts/typings/*",
            "src/highcharts/constants/*",
            "src/highcharts/lib",
        ]),*/
    ],
    options: DefaultOptions,
};
