// (C) 2025 GoodData Corporation

import {
    IInsight,
    insightVisualizationType,
    insightMeasures,
    insightBuckets,
    IBucket,
} from "@gooddata/sdk-model";

export function supportsShowAsTable(insightType?: string): boolean {
    return (
        insightType !== "table" &&
        insightType !== "repeater" &&
        insightType !== "headline" &&
        insightType !== "xirr"
    );
}

/**
 * Converts any insight (except of type "table", "repeater", or "headline") to a table insight definition.
 * For table, repeater, or headline insights, returns the original insight.
 *
 * @param insight - The input insight to convert.
 * @returns IInsight with table visualization or the original insight if already table/repeater/headline.
 * @public
 */
export function convertInsightToTableDefinition(insight: IInsight): IInsight {
    const type = insightVisualizationType(insight);
    if (!supportsShowAsTable(type)) {
        return insight;
    }

    // Use sdk-model utils to extract all measures and attributes
    // and build table buckets according to PluggablePivotTable conventions
    // - 'measures' bucket: all measures
    // - 'attributes' bucket: all attributes
    // - 'columns' bucket: empty (can be customized if needed)
    // This is a safe default for generic conversion
    // If more advanced splitting is needed (e.g. from view/stack by), logic can be extended
    //
    // Note: IBucket type is imported from sdk-model
    //
    // The output insight will have only these three buckets

    // Import bucket utilities for splitting attributes
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    // PluggablePivotTable convention: row attributes come from the first attribute bucket (view by, trend by, etc),
    // column attributes come from the second attribute bucket (columns, stack by, etc)
    // Measures always from 'measures' bucket
    // See getRowAttributes and getColumnAttributes in PluggablePivotTable

    const buckets = insightBuckets(insight);
    const measures = insightMeasures(insight);

    // Helper to match bucket by common attribute bucket names
    const isRowBucket = (bucket: IBucket) =>
        ["attribute", "attributes", "attribute_from", "attribute_to", "view", "trend", "location"].includes(
            bucket.localIdentifier ?? "",
        );
    const isColumnBucket = (bucket: IBucket) =>
        ["columns", "stack", "segment"].includes(bucket.localIdentifier ?? "");

    // Find first row and first column bucket
    const rowBucket = buckets.find(isRowBucket);
    const columnBucket = buckets.find(isColumnBucket);

    const rowAttributes = rowBucket?.items ?? [];
    const columnAttributes = columnBucket?.items ?? [];

    const tableBuckets = [
        {
            localIdentifier: "measures",
            items: measures,
        },
        {
            localIdentifier: "attribute",
            items: rowAttributes,
        },
        {
            localIdentifier: "columns",
            items: columnAttributes,
        },
    ];

    const tableInsight: IInsight = {
        ...insight,
        insight: {
            ...insight.insight,
            visualizationUrl: "local:table",
            buckets: tableBuckets,
        },
    };
    return tableInsight;
}
