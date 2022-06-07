// (C) 2007-2022 GoodData Corporation
import {
    IDimension,
    IExecutionDefinition,
    ITotal,
    MeasureGroupIdentifier,
    TotalType,
} from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap";
import { Total, TotalDimension, TotalFunctionEnum } from "@gooddata/api-client-tiger";
import { dimensionLocalIdentifier } from "./DimensionsConverter";

/**
 * Extracts total definitions from execution definition dimensions and converts them into total specifications for
 * Tiger AFM. Execution definition defines totals by a measure, aggregation function, and the attribute for whose
 * values we want the totals. In Tiger, measure and aggregation function remains the same, but the `totalDimensions`
 * with `totalDimensionItems` are best understood as coordinates for the resulting structure where the totals
 * should be placed. This implicitly decides which attributes should be used. This allows for multidimensional totals,
 * but such totals are impossible to define in the execution definition.
 */
export function convertTotals(def: IExecutionDefinition): Total[] {
    const allTotalDimensions: TotalDimension[] = def.dimensions.map((dim, dimIdx) => {
        return {
            dimensionIdentifier: dimensionLocalIdentifier(dimIdx),
            totalDimensionItems: dim.itemIdentifiers,
        };
    });
    return flatMap(def.dimensions, (dim, dimIdx) => {
        return dim.totals?.map((total) => {
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
    }).filter((total): total is Total => total !== undefined);
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
