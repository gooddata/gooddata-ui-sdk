// (C) 2025 GoodData Corporation

import {
    ArithmeticMeasureOperator,
    IArithmeticMeasureDefinition,
    IBucket,
    IInsight,
    IMeasure,
    bucketMeasure,
    bucketsFind,
    insightBuckets,
    insightMeasures,
    insightProperties,
    insightVisualizationType,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    newVirtualArithmeticMeasure,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

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
 * Comparison configuration interface matching sdk-ui-charts comparison types
 * @see {@link @gooddata/sdk-ui-charts#IComparison}
 */
interface IComparison {
    enabled?: boolean;
    calculationType?: "change" | "ratio" | "difference" | "change_difference";
}

/**
 * Default format strings for comparison calculations
 * These match the defaults from sdk-ui-charts/headlineHelper.ts CALCULATION_VALUES_DEFAULT
 *
 * @remarks
 * - CHANGE: Percentage change between primary and secondary
 * - RATIO: Ratio of primary to secondary as percentage
 * - DIFFERENCE: Absolute difference (null means inherit from primary measure)
 * - CHANGE_DIFFERENCE: Both percentage and absolute (sub-value uses null to inherit)
 */
const COMPARISON_FORMATS = {
    change: "#,##0%",
    ratio: "#,##0%",
    difference: null, // null means inherit format from primary measure
    change_difference: {
        main: "#,##0%",
        sub: null, // Absolute difference (inherit)
    },
} as const;

/**
 * Extracts comparison configuration from insight properties
 */
function getComparisonConfig(insight: IInsight): IComparison | undefined {
    const properties = insightProperties(insight);
    return properties["controls"]?.comparison;
}

/**
 * Checks if a headline insight has comparison enabled and exactly one secondary measure
 * Matches the logic from HeadlineProviderFactory.isComparisonType in sdk-ui-charts
 *
 * @param insight - The insight to check
 * @returns true if the insight is a headline with comparison enabled
 *
 * @remarks
 * A headline qualifies for comparison if:
 * 1. It's a "headline" visualization type
 * 2. It has both a primary and secondary measure
 * 3. Comparison is enabled in config (defaults to true)
 *
 */
function isHeadlineWithComparison(insight: IInsight): boolean {
    const type = insightVisualizationType(insight);
    if (type !== "headline") {
        return false;
    }

    const buckets = insightBuckets(insight);
    const primaryBucket = bucketsFind(buckets, BucketNames.MEASURES);
    const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);

    const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);
    const secondaryMeasure = secondaryBucket && bucketMeasure(secondaryBucket);

    if (!primaryMeasure || !secondaryMeasure) {
        return false;
    }

    const comparison = getComparisonConfig(insight);
    return comparison?.enabled ?? true;
}

/**
 * Determines the calculation type for headline comparison
 * Matches the logic from ComparisonProvider in sdk-ui-charts
 *
 * @param secondaryMeasure - The secondary measure to compare against
 * @param comparison - Optional comparison configuration from insight properties
 * @returns The calculation type to use
 *
 * @remarks
 * Default logic (when no calculationType is configured):
 * - If secondary measure is derived (PoP, Previous Period) → use "change" (percentage change)
 * - If secondary measure is regular → use "ratio" (proportion)
 *
 */
function getCalculationType(
    secondaryMeasure: IMeasure,
    comparison: IComparison | undefined,
): "change" | "ratio" | "difference" | "change_difference" {
    if (comparison?.calculationType) {
        return comparison.calculationType;
    }

    if (isPoPMeasure(secondaryMeasure) || isPreviousPeriodMeasure(secondaryMeasure)) {
        return "change";
    }

    return "ratio";
}

/**
 * Creates virtual arithmetic measures for headline comparison
 * Replicates the logic from ComparisonProvider in sdk-ui-charts
 *
 * @param primaryMeasure - The primary measure
 * @param secondaryMeasure - The secondary measure to compare against
 * @param calculationType - The type of calculation to perform
 * @returns Array of virtual arithmetic measures (1 or 2 depending on calculation type)
 *
 * @remarks
 * Virtual arithmetic measures are calculated by the backend:
 * - "change": ((primary - secondary) / secondary) * 100
 * - "ratio": (primary / secondary)
 * - "difference": (primary - secondary)
 * - "change_difference": Both change AND difference as separate measures
 *
 * The backend performs all calculations; we just create the measure definitions.
 * Format strings are applied so values display correctly (e.g., "25%" instead of "0.25").
 *
 * @see {@link sdk-backend-tiger/MeasureConverter.ts#convertArithmeticMeasureDefinition}
 */
function createHeadlineComparisonMeasures(
    primaryMeasure: IMeasure,
    secondaryMeasure: IMeasure,
    calculationType: "change" | "ratio" | "difference" | "change_difference",
): IMeasure<IArithmeticMeasureDefinition>[] {
    const createVirtualArithmeticMeasure = (
        operator: ArithmeticMeasureOperator,
        format: string | null,
        shouldCombineLocalIdAndOperator?: boolean,
    ): IMeasure<IArithmeticMeasureDefinition> => {
        return newVirtualArithmeticMeasure([primaryMeasure, secondaryMeasure], operator, (builder) => {
            if (shouldCombineLocalIdAndOperator) {
                builder.combineLocalIdWithOperator();
            }
            // Apply format: null means inherit from primary measure, string means use explicit format
            if (format !== null) {
                builder.format(format);
            }
            return builder;
        });
    };

    switch (calculationType) {
        case "difference":
            return [createVirtualArithmeticMeasure("difference", COMPARISON_FORMATS.difference)];

        case "ratio":
            return [createVirtualArithmeticMeasure("ratio", COMPARISON_FORMATS.ratio)];

        case "change":
            return [createVirtualArithmeticMeasure("change", COMPARISON_FORMATS.change)];

        case "change_difference":
            return [
                createVirtualArithmeticMeasure("change", COMPARISON_FORMATS.change_difference.main, true),
                createVirtualArithmeticMeasure("difference", COMPARISON_FORMATS.change_difference.sub, true),
            ];

        default:
            return [];
    }
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
    const baseMeasures = insightMeasures(insight);

    // Handle headline comparison: add virtual arithmetic measures for change/difference/ratio
    const comparisonMeasures: IMeasure<IArithmeticMeasureDefinition>[] = [];
    if (isHeadlineWithComparison(insight)) {
        const primaryBucket = bucketsFind(buckets, BucketNames.MEASURES);
        const secondaryBucket = bucketsFind(buckets, BucketNames.SECONDARY_MEASURES);

        const primaryMeasure = primaryBucket && bucketMeasure(primaryBucket);
        const secondaryMeasure = secondaryBucket && bucketMeasure(secondaryBucket);

        if (primaryMeasure && secondaryMeasure) {
            const comparison = getComparisonConfig(insight);
            const calculationType = getCalculationType(secondaryMeasure, comparison);
            comparisonMeasures.push(
                ...createHeadlineComparisonMeasures(primaryMeasure, secondaryMeasure, calculationType),
            );
        }
    }

    const measures = [...baseMeasures, ...comparisonMeasures];

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
