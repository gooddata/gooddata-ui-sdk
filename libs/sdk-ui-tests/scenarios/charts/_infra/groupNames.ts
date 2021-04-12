// (C) 2007-2020 GoodData Corporation

/**
 * Default names for scenario groups.
 */
export const ScenarioGroupNames = {
    /**
     * This group should be used for all test scenarios that exercise various bucket configurations of the chart
     */
    BucketConfigVariants: "base",

    /**
     * This group should be used for test scenarios that exercise optional stacking in different charts
     */
    Stacking: "stacking",

    /**
     * This group should be used for test scenarios that exercise drilling.
     */
    Drilling: "drilling",

    /**
     * This is fallback group for visualization customization scenarios. If the visualization has very rich
     * config possibilities to test, consider creating sub-groups.
     */
    ConfigurationCustomization: "customization",

    /**
     * Group for axes customization scenarios
     */
    Axes: ["customization", "axes"],

    /**
     * Group for coloring customization scenarios
     */
    Coloring: ["customization", "color"],

    /**
     * Group for theming customization scenarios
     */
    Theming: ["customization", "theme"],

    /**
     * Group for responsive customization scenarios
     */
    Responsive: ["customization", "responsive"],

    /**
     * Group for legend responsive scenarios
     */
    LegendResponsive: ["customization", "legend responsive"],
};
