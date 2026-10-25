// (C) 2021-2026 GoodData Corporation

export enum TabNames {
    ALL_TAB_NAME = "all",
    MEASURES_TAB_NAME = "measures",
    ATTRIBUTES_TAB_NAME = "attributes",
}

export enum TabIcons {
    METRICS = "metrics",
    FACTS = "facts",
    ATTRIBUTES = "attributes",
    GEO_ATTRIBUTES = "geoAttributes",
}

export enum TabTypes {
    MEASURE = "measure",
    FACT = "fact",
    ATTRIBUTE = "attribute",
    COMPUTED_ATTRIBUTE = "computedAttribute",
}

export enum TabIconGroups {
    METRIC_FACT = "metric_fact",
    ATTRIBUTE = "attribute",
}

export interface ICatalogFilter {
    name: TabNames | TabIcons;
    label: string;
    group?: TabIconGroups;
}
