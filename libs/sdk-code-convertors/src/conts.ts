// (C) 2024-2026 GoodData Corporation

export const DatasetTypes = ["dataset"];

export const DateDatasetTypes = ["date"];

export const MetricTypes = ["metric"];

export const DashboardTypes = ["dashboard"];

export const PluginTypes = ["plugin"];

export const AttributeHierarchyTypes = ["attribute_hierarchy"];

export const VisualisationsTypes = [
    "table",
    "bar_chart",
    "column_chart",
    "line_chart",
    "area_chart",
    "scatter_chart",
    "bubble_chart",
    "pie_chart",
    "donut_chart",
    "treemap_chart",
    "pyramid_chart",
    "funnel_chart",
    "heatmap_chart",
    "bullet_chart",
    "waterfall_chart",
    "dependency_wheel_chart",
    "sankey_chart",
    "headline_chart",
    "combo_chart",
    "geo_chart",
    "geo_area_chart",
    "repeater_chart",
];

export const AllTypes = [
    ...DatasetTypes,
    ...DateDatasetTypes,
    ...MetricTypes,
    ...DashboardTypes,
    ...PluginTypes,
    ...VisualisationsTypes,
    ...AttributeHierarchyTypes,
];
