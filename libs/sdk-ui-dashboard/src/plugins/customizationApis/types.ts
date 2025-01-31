// (C) 2021-2025 GoodData Corporation

export type CustomizerMutationsContext = {
    insight: CustomizerMutationsType[];
    kpi: CustomizerMutationsType[];
    attributeFilter: CustomizerMutationsType[];
    dashboardContent: CustomizerMutationsType[];
    topBar: CustomizerMutationsType[];
    filterBar: CustomizerMutationsType[];
    layout: CustomizerMutationsType[];
    richText: CustomizerMutationsType[];
    title: CustomizerMutationsType[];
    loading: CustomizerMutationsType[];
    visualizationSwitcher: CustomizerMutationsType[];
    visualizationSwitcherToolbar: CustomizerMutationsType[];
    layouts: Record<string, CustomizerMutationsType>;
    exports: CustomizerMutationsType[];
};

export type CustomizerMutationsType = "tag" | "provider" | "body" | "decorator" | "inserted" | "transformed";

export function createCustomizerMutationsContext(): CustomizerMutationsContext {
    return {
        insight: [],
        filterBar: [],
        topBar: [],
        layout: [],
        richText: [],
        title: [],
        kpi: [],
        loading: [],
        attributeFilter: [],
        visualizationSwitcherToolbar: [],
        visualizationSwitcher: [],
        dashboardContent: [],
        layouts: {},
        exports: [],
    };
}
