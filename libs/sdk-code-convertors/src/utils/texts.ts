// (C) 2023-2026 GoodData Corporation

export const DATASET_COMMENT = [
    " A dataset is a logical object that represents a set of related facts, attributes, and attribute labels.",
    " Datasets are basic organization units of a logical data model.",
    " Read more about Datasets:",
    " https://www.gooddata.com/developers/cloud-native/doc/cloud/model-data/concepts/dataset/",
].join("\n");

export const DATE_INSTANCE_COMMENT = [
    " A Date dataset is a dataset in the logical data model(LDM)",
    " that represents DATE / TIMESTAMP columns in your database.",
    " Read more about date instances:",
    " https://www.gooddata.com/developers/cloud-native/doc/cloud/model-data/concepts/dataset/#date-datasets",
].join("\n");

export const METRIC_COMMENT = [
    " A metric is a computational expression of numerical data (facts or other metrics).",
    " Use MAQL to create reusable multidimensional queries that combine multiple facts and attributes.",
    " Read more about MAQL:",
    " https://www.gooddata.com/developers/cloud-native/doc/cloud/create-metrics/maql/",
].join("\n");

export const VISUALISATION_COMMENT = [
    " A visualization is a visual representation of a user's analytical view of the data.",
    " You build visualizations from metrics, attributes, and optionally filters that are combined in a way to visualize a particular aspect of your data.",
    " The visualizations are executed over and over as fresh data gets loaded.",
    " Interpreting the content of a visualization is up to the user (the consumer of the visualization).",
    " Read more about visualisations:",
    " https://www.gooddata.com/developers/cloud-native/doc/cloud/create-visualizations/concepts/visualization/",
].join("\n");

export const DASHBOARD_COMMENT = [
    " A dashboard is a collection of visualizations that are organized into sections.",
    " Because they allow filtering and other adjustments, they function as a dynamic presentation layer for your data analytics.",
    " Read more about dashboards:",
    " https://www.gooddata.com/docs/cloud/create-dashboards/concepts/dashboard/",
].join("\n");

export const ATTRIBUTE_HIERARCHY_COMMENT = [
    " The attribute hierarchy is a user-defined list of attributes. This list determines the order ",
    " in which subsequent attributes are revealed in a visualization during the drill-down process. ",
    " Attributes lower in this hierarchy are automatically filtered based on the values selected from the higher-level attributes.",
    " Read more about attribute hierarchies:",
    " https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-down/",
].join("\n");

export const PLUGIN_COMMENT = [
    " Dashboard plugins allow developers to create and integrate custom code into the Dashboard component.",
    " With the plugins, you as a developer can customize and enhance the default dashboard experience available to the dashboard consumers.",
    " Read more about dashboard plugins:",
    " https://www.gooddata.com/docs/gooddata-ui/latest/references/dashboard_component/dashboard_plugins/",
].join("\n");
