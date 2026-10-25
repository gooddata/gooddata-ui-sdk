// (C) 2026 GoodData Corporation

export function extractVisualizationObjectAttributeFilterElements<T>(
    attributeFilter: { positiveAttributeFilter: { in: T } } | { negativeAttributeFilter: { notIn: T } },
): T {
    if ("positiveAttributeFilter" in attributeFilter) {
        return attributeFilter.positiveAttributeFilter.in;
    }
    if ("negativeAttributeFilter" in attributeFilter) {
        return attributeFilter.negativeAttributeFilter.notIn;
    }
    return undefined;
}

export function isSingleEmptyStringElement(elements: unknown[]): boolean {
    return elements.length === 1 && elements[0] === "";
}
