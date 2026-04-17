// (C) 2026 GoodData Corporation

export function useCatalogItemFeed() {
    return {
        items: [],
        error: null,
        status: "success" as const,
        totalCount: 0,
        totalCountByType: {
            analyticalDashboard: 0,
            insight: 0,
            measure: 0,
            parameter: 0,
            attribute: 0,
            fact: 0,
            dataSet: 0,
        },
        hasNext: false,
        next: () => {},
        updateItem: () => {},
        removeItem: () => {},
        refetchObjectType: () => {},
    };
}
