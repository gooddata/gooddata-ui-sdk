// (C) 2007-2022 GoodData Corporation
import isEqual from "lodash/isEqual.js";
import {
    bucketsFind,
    bucketItemLocalId,
    bucketAttributes,
    bucketTotals,
    IAttribute,
    IBucket,
    IDimension,
    IExecutionDefinition,
    ITotal,
    MeasureGroupIdentifier,
    TotalType,
    IMeasure,
} from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap.js";
import { Total, TotalDimension, TotalFunctionEnum } from "@gooddata/api-client-tiger";
import { dimensionLocalIdentifier } from "./DimensionsConverter.js";

const ATTRIBUTE = "attribute";
const COLUMNS = "columns";

function getMeasureOrder(total: Total, measures: IMeasure[]) {
    return measures.findIndex((m) => m.measure.localIdentifier === total.metric);
}

function enrichTotalWithMeasureIndex(total: Total, measures: IMeasure[]) {
    return {
        order: getMeasureOrder(total, measures),
        total,
    };
}
/**
 * Extracts total definitions from execution definition dimensions and converts them into total specifications for
 * Tiger AFM. Execution definition defines totals by a measure, aggregation function, and the attribute for whose
 * values we want the totals. In Tiger, measure and aggregation function remains the same, but the `totalDimensions`
 * with `totalDimensionItems` are best understood as coordinates for the resulting structure where the totals
 * should be placed. This implicitly decides which attributes should be used. This allows for multidimensional totals,
 * but such totals are impossible to define in the execution definition.
 */
export function convertTotals(def: IExecutionDefinition): Total[] {
    const { buckets, dimensions } = def;

    const allTotalDimensions: TotalDimension[] = dimensions.map((dim, dimIdx) => {
        return {
            dimensionIdentifier: dimensionLocalIdentifier(dimIdx),
            totalDimensionItems: dim.itemIdentifiers,
        };
    });

    const totals = flatMap(dimensions, (dim, dimIdx) => {
        const mappedTotals = dim.totals?.map((total) => {
            const tigerTotal: Total = {
                localIdentifier: totalLocalIdentifier(total, dimIdx),
                function: convertTotalType(total.type),
                metric: total.measureIdentifier,
                totalDimensions: convertTotalDimensions(
                    total,
                    dim,
                    dimensionLocalIdentifier(dimIdx),
                    allTotalDimensions,
                ),
            };
            return tigerTotal;
        });

        // need to send these totals ordered to the backend so that we get executed totals in correct order
        const totalsWithOrders = mappedTotals?.map((total) =>
            enrichTotalWithMeasureIndex(total, def.measures),
        );
        return totalsWithOrders?.sort((total1, total2) => total1.order - total2.order).map((t) => t.total);
    }).filter((total): total is Total => total !== undefined);

    /**
     * With new column totals, we need to have in consideration the cases where same totals/subtotals are selected for rows and columns.
     * This new cases would require extra configuration so Tiger AFM is able to compute properly the result.
     * These new cases are -
     *   1. Grand totals - is the value obtained from row and column totals.
     *   2. Marginal totals - is the value obtained within the subgroups from row and column subtotals.
     *
     * For `Grand Totals`, in Tiger AFM, you specify that you want total of totals with total that have only "measureGroup" present.
     * For `Marginal Total`, in Tiger AFM, would need to iterate through both dimensions and obtain the missing totalDimensions items
     * based on the attribute and column identifiers order in buckets.
     */

    const attributeBucket = bucketsFind(buckets, ATTRIBUTE);
    const columnBucket = bucketsFind(buckets, COLUMNS);

    const matchingAttributeBucket = attributeBucket ? bucketAttributes(attributeBucket) : [];
    const matchingColumnBucket = columnBucket ? bucketAttributes(columnBucket) : [];

    let newTotals = totals;

    if (hasRowOrColumnTotals(attributeBucket, columnBucket)) {
        const attributeIdentifiers = getAttributeBucketIdentifiers(matchingAttributeBucket);
        const columnIdentifiers = getAttributeBucketIdentifiers(matchingColumnBucket);

        attributeBucket!.totals?.forEach((attributeTotal, index) => {
            let hasRowAndColumnGrandTotals = false;
            let hasRowAndColumnSubTotals = false;
            let hasRowSubtotalAndColumnGrandTotal = false;
            let hasColumnSubtotalAndRowGrandTotal = false;
            let attributeDimensionIndex = 0;
            let columnDimensionIndex = 0;
            let attributeSubtotalDimensionIndex = 0;
            let columnSubtotalDimensionIndex = 0;
            columnBucket!.totals?.forEach((columnTotal, columnIndex) => {
                const attributeMeasureId = attributeTotal.measureIdentifier;
                const attributeType = attributeTotal.type;
                const columnMeasureId = columnTotal.measureIdentifier;
                const columnType = columnTotal.type;
                // Check for totals from same measure and type
                if (
                    attributeAndColumnHasSameTotal(
                        attributeMeasureId,
                        attributeType,
                        columnMeasureId,
                        columnType,
                    )
                ) {
                    // Check for grand totals rows/columns
                    // Grand total is always defined on the very first attribute of the attribute/columns bucket
                    if (
                        attributeTotal.attributeIdentifier === attributeIdentifiers[0] &&
                        columnTotal.attributeIdentifier === columnIdentifiers[0]
                    ) {
                        hasRowAndColumnGrandTotals = true;
                    }

                    // Check for subtotals rows/columns
                    if (
                        attributeTotal.attributeIdentifier !== attributeIdentifiers[0] &&
                        columnTotal.attributeIdentifier !== columnIdentifiers[0]
                    ) {
                        attributeDimensionIndex = attributeIdentifiers.findIndex(
                            (aI) => aI === attributeTotal.attributeIdentifier,
                        );
                        columnDimensionIndex = columnIdentifiers.findIndex(
                            (cI) => cI === columnTotal.attributeIdentifier,
                        );

                        hasRowAndColumnSubTotals = true;
                    }

                    // Check for rows subtotals within columns grand totals
                    if (
                        attributeTotal.attributeIdentifier !== attributeIdentifiers[0] &&
                        columnTotal.attributeIdentifier === columnIdentifiers[0]
                    ) {
                        hasRowSubtotalAndColumnGrandTotal = true;
                        attributeSubtotalDimensionIndex = attributeIdentifiers.findIndex(
                            (aI) => aI === attributeTotal.attributeIdentifier,
                        );
                    }

                    // Check for columns subtotals within rows grand totals
                    if (
                        attributeTotal.attributeIdentifier === attributeIdentifiers[0] &&
                        columnTotal.attributeIdentifier !== columnIdentifiers[0]
                    ) {
                        hasColumnSubtotalAndRowGrandTotal = true;
                        columnSubtotalDimensionIndex = columnIdentifiers.findIndex(
                            (cI) => cI === columnTotal.attributeIdentifier,
                        );
                    }
                }

                /**
                 * Extend marginal totals payload
                 *
                 * To obtain marginal totals we need to slice through the attribute ids on each bucket, until the selected
                 * attribute identifier for rows and totals, obtained on the previous step, is found.
                 */
                if (hasRowAndColumnSubTotals) {
                    const marginalTotal: Total[] = [
                        {
                            function: convertTotalType(attributeTotal.type),
                            metric: attributeTotal.measureIdentifier,
                            localIdentifier: marginalTotalLocalIdentifier(attributeTotal, columnIndex),
                            totalDimensions: [
                                {
                                    dimensionIdentifier: "dim_0",
                                    totalDimensionItems: attributeIdentifiers.slice(
                                        0,
                                        attributeDimensionIndex,
                                    ),
                                },
                                {
                                    dimensionIdentifier: "dim_1",
                                    totalDimensionItems: columnIdentifiers
                                        .slice(0, columnDimensionIndex)
                                        .concat(MeasureGroupIdentifier),
                                },
                            ],
                        },
                    ];
                    newTotals = [...newTotals, ...marginalTotal];
                }
            });

            /**
             * Extend marginal totals of rows within column grand totals payload.
             *
             * We need to slice through the attribute ids on the bucket from second dimension, until the selected
             * attribute identifier is found.
             */
            if (hasRowSubtotalAndColumnGrandTotal) {
                const grandTotalOfSubTotal: Total[] = [
                    {
                        function: convertTotalType(attributeTotal.type),
                        metric: attributeTotal.measureIdentifier,
                        localIdentifier: subTotalColumnLocalIdentifier(attributeTotal, index),
                        totalDimensions: [
                            {
                                dimensionIdentifier: "dim_0",
                                totalDimensionItems: attributeIdentifiers.slice(
                                    0,
                                    attributeSubtotalDimensionIndex,
                                ),
                            },
                            {
                                dimensionIdentifier: "dim_1",
                                totalDimensionItems: [MeasureGroupIdentifier],
                            },
                        ],
                    },
                ];
                newTotals = [...newTotals, ...grandTotalOfSubTotal];
            }

            /**
             * Extend marginal of columns within rows grand totals payload.
             *
             * We need to slice through the attribute ids on the bucket from first dimension, until the selected
             * attribute identifier is found.
             */
            if (hasColumnSubtotalAndRowGrandTotal) {
                const grandTotalOfSubTotal: Total[] = [
                    {
                        function: convertTotalType(attributeTotal.type),
                        metric: attributeTotal.measureIdentifier,
                        localIdentifier: subTotalRowLocalIdentifier(attributeTotal, index),
                        totalDimensions: [
                            {
                                dimensionIdentifier: "dim_1",
                                totalDimensionItems: columnIdentifiers
                                    .slice(0, columnSubtotalDimensionIndex)
                                    .concat(MeasureGroupIdentifier),
                            },
                        ],
                    },
                ];
                newTotals = [...newTotals, ...grandTotalOfSubTotal];
            }

            // extend grand totals payload
            if (hasRowAndColumnGrandTotals) {
                const grandTotal: Total[] = [
                    {
                        function: convertTotalType(attributeTotal.type),
                        metric: attributeTotal.measureIdentifier,
                        localIdentifier: grandTotalLocalIdentifier(attributeTotal, index),
                        totalDimensions: [
                            {
                                dimensionIdentifier: "dim_1",
                                totalDimensionItems: [MeasureGroupIdentifier],
                            },
                        ],
                    },
                ];
                newTotals = [...newTotals, ...grandTotal];
            }
        });
    }

    return newTotals;
}

/**
 * Given a `total` from execution definition, use total.attributeIdentifier in the context of the `dimension`
 * to select appropriate total dimensions and their items for Tiger API. Add measureGroup if it exists.
 * All resulting totals can only be one-dimensional. To achieve that we must add all other dimensions to the total.
 * In the dimension of the total, we want to add all items that occur before the total.attributeIdentifier.
 * If total.attributeIdentifier is the first item, the total will be a grand total. Otherwise, it will be a subtotal.
 */
function convertTotalDimensions(
    total: ITotal,
    dimension: IDimension,
    dimensionIdentifier: string,
    allTotalDimensions: TotalDimension[],
): TotalDimension[] {
    const itemIndex = dimension.itemIdentifiers.indexOf(total.attributeIdentifier);
    const totalDimensionItems = dimension.itemIdentifiers.slice(0, itemIndex);
    // We want to always include the measureGroup item if it exists
    // Only one value from the measureGroup will be non-null - the one corresponding to the metric of the Total
    // However, including the whole group makes it easier to place the resulting numbers at their correct places
    if (
        dimension.itemIdentifiers.includes(MeasureGroupIdentifier) &&
        !totalDimensionItems.includes(MeasureGroupIdentifier)
    ) {
        totalDimensionItems.push(MeasureGroupIdentifier);
    }

    return allTotalDimensions
        .filter((dim) => dim.dimensionIdentifier !== dimensionIdentifier)
        .concat(totalDimensionItems.length > 0 ? [{ dimensionIdentifier, totalDimensionItems }] : []);
}

export function totalLocalIdentifier(total: ITotal, dimIdx: number): string {
    return `total_${total.type}_${total.measureIdentifier}_by_${total.attributeIdentifier}_${dimIdx}`;
}

export function grandTotalLocalIdentifier(total: ITotal, dimIdx: number): string {
    return `total_of_totals_${total.type}_${total.measureIdentifier}_by_${total.attributeIdentifier}_${dimIdx}`;
}

export function subTotalRowLocalIdentifier(total: ITotal, dimIdx: number): string {
    return `subtotal_row_${total.type}_${total.measureIdentifier}_by_${total.attributeIdentifier}_${dimIdx}`;
}

export function subTotalColumnLocalIdentifier(total: ITotal, dimIdx: number): string {
    return `subtotal_column_${total.type}_${total.measureIdentifier}_by_${total.attributeIdentifier}_${dimIdx}`;
}

export function marginalTotalLocalIdentifier(total: ITotal, dimIdx: number): string {
    return `marginal_total_${total.type}_${total.measureIdentifier}_by_${total.attributeIdentifier}_${dimIdx}`;
}

function convertTotalType(type: TotalType): TotalFunctionEnum {
    if (type === "sum") {
        return TotalFunctionEnum.SUM;
    }
    if (type === "max") {
        return TotalFunctionEnum.MAX;
    }
    if (type === "min") {
        return TotalFunctionEnum.MIN;
    }
    if (type === "avg") {
        return TotalFunctionEnum.AVG;
    }
    if (type === "med") {
        return TotalFunctionEnum.MED;
    }
    // type === "nat"
    throw new Error("Tiger backend does not support native totals.");
}

function getAttributeBucketIdentifiers(attribute: IAttribute[]) {
    return attribute.map((a) => bucketItemLocalId(a));
}

/**
 * Check if there are totals defined on attributes and columns (rows and columns), to extend Tiger AFM accordingly.
 */
function hasRowOrColumnTotals(
    attributeBucket: IBucket | undefined,
    columnBucket: IBucket | undefined,
): boolean {
    const attributeTotals = attributeBucket ? bucketTotals(attributeBucket) : [];
    const columnTotals = columnBucket ? bucketTotals(columnBucket) : [];

    return attributeTotals.length > 0 && columnTotals.length > 0;
}

function attributeAndColumnHasSameTotal(
    attributeMeasureId: string,
    attributeType: string,
    columnMeasureId: string,
    columnType: string,
): boolean {
    return isEqual(attributeMeasureId, columnMeasureId) && isEqual(attributeType, columnType);
}
