// (C) 2025 GoodData Corporation

import {
    IBucket,
    IInsight,
    insightBuckets,
    insightMeasures,
    insightVisualizationType,
} from "@gooddata/sdk-model";

/**
 * Determines if a visualization type supports the "Show as Table" UI button.
 * This controls whether users can manually toggle table view in the UI.
 *
 * @param insightType - The visualization type to check
 * @returns true if the visualization supports the Show as Table UI feature
 * @public
 */
export function supportsShowAsTable(insightType?: string): boolean {
    return (
        insightType !== "table" &&
        insightType !== "repeater" &&
        insightType !== "headline" &&
        insightType !== "xirr"
    );
}

/**
 * Determines if a visualization type can be converted to table format.
 * This is used for accessibility and export purposes, separate from UI controls.
 *
 * @param insightType - The visualization type to check
 * @returns true if the visualization can be converted to table format
 * @public
 */
export function canConvertToTable(insightType?: string): boolean {
    return insightType !== "table" && insightType !== "repeater" && insightType !== "xirr";
}

/**
 * Converts any insight (except of type "table", "repeater", or "xirr") to a table insight definition.
 * For table, repeater, or xirr insights, returns the original insight.
 *
 * @param insight - The input insight to convert.
 * @returns IInsight with table visualization or the original insight if conversion is not supported.
 * @public
 */
export function convertInsightToTableDefinition(insight: IInsight): IInsight {
    const type = insightVisualizationType(insight);
    if (!canConvertToTable(type)) {
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

    const rowBuckets = buckets.filter(isRowBucket);
    const columnBuckets = buckets.filter(isColumnBucket);

    const rowAttributes = rowBuckets.map((bucket) => bucket.items).flat();
    const columnAttributes = columnBuckets.map((bucket) => bucket.items).flat();

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

    const onlyMeasures = !rowAttributes.length && !columnAttributes.length;
    const propertiesProp = onlyMeasures
        ? {
              properties: {
                  controls: {
                      measureGroupDimension: "rows",
                  },
              },
          }
        : {};

    const tableInsight: IInsight = {
        ...insight,
        insight: {
            ...insight.insight,
            visualizationUrl: "local:table",
            buckets: tableBuckets,
            ...propertiesProp,
        },
    };
    return tableInsight;
}
