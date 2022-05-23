// (C) 2007-2022 GoodData Corporation
import {
    IDimension,
    IExecutionDefinition,
    ITotal,
    MeasureGroupIdentifier,
    TotalType,
} from "@gooddata/sdk-model";
import groupBy from "lodash/groupBy";
import flatMap from "lodash/flatMap";
import isEmpty from "lodash/isEmpty";
import { GrandTotal, GrandTotalFunctionEnum } from "@gooddata/api-client-tiger";

/**
 * Extracts total definitions from execution definition dimensions and converts them into total specifications for
 * tiger AFM. Totals in tiger are defined more explicitly and therefore also more generally. Specifically a total is
 * defined by `includedDimensions`, i.e. the actual dimension on which it will be computed. Also there's a possibility
 * to compute totals only for some attribute values from an attribute in a dimension. While this is again working
 * for any attribute (e.g. compute totals only for US column of Country attribute) it's probably mostly useful only in
 * case of the measureGroup pseudo-attribute.
 *
 * TODO: subtotals
 */
export function convertTotals(def: IExecutionDefinition): Array<GrandTotal> {
    const allDimensionIndexes = def.dimensions.map((_dim, idx) => idx);
    return withTotals(def.dimensions, (dimIdx, _typeIdx, totalsOfType) => {
        // (one-dimensional) grand total is defined in Tiger by all dimensions except the current one
        const includedDimensionIndexes = allDimensionIndexes.filter((idx) => dimIdx != idx);
        const measureIdentifiers = totalsOfType.map((total) => total.measureIdentifier);
        const includedDimensionss = includedDimensionIndexes.map((includedDimIdx) => {
            const dim = def.dimensions[includedDimIdx];
            const dimensionAttributesValues = dim.itemIdentifiers.includes(MeasureGroupIdentifier)
                ? { dimensionAttributesValues: { [MeasureGroupIdentifier]: measureIdentifiers } }
                : null;
            // FIXME synchronize dimensionIdentifier naming with convertDimensions
            return { [`dim_${includedDimIdx}`]: dimensionAttributesValues };
        });
        const totalType = totalsOfType[0].type;

        return {
            localIdentifier: totalLocalIdentifier(totalType, dimIdx),
            function: convertTotalType(totalType as TotalType),
            includedDimensions: Object.assign({}, ...includedDimensionss),
        };
    });
}

/**
 * Traverse given dimensions and their total definitions, group those by total type and call totalProcessor on each
 * of these groups, together with current dimension index (dimIdx) and total type index in that dimension (typeIdx).
 *
 * This function captures the contract between execution response and execution result. Both of these response
 * structures are synchronized using local identifiers induced from dimIdx typeIdx. In the future the function should
 * be replaced by explicit concept of total local identifiers both in ITotal and ITotalDescriptor. Currently, given
 * the rather limit functionality of general totals API, it's needed/useful only in Tiger.
 */
export function withTotals<T>(
    dimensions: IDimension[],
    totalProcessor: (dimIdx: number, typeIdx: number, totalsOfType: ITotal[]) => T,
): T[] {
    validateTotals(dimensions);
    return flatMap(dimensions, (dim, dimIdx) => {
        const totalsByType = groupBy(dim.totals || [], (total) => total.type);
        return Object.keys(totalsByType).map((type, typeIdx) =>
            totalProcessor(dimIdx, typeIdx, totalsByType[type]),
        );
    });
}

export function totalLocalIdentifier(type: TotalType, dimIdx: number): string {
    return `total_${dimIdx}_${type}`;
}

function validateTotals(dimensions: IDimension[]) {
    for (const dim of dimensions) {
        if (isEmpty(dim.totals)) {
            continue;
        }
        const firstDimensionItem = dim.itemIdentifiers[0];
        dim.totals?.forEach((totalDef) => {
            if (totalDef.attributeIdentifier != firstDimensionItem) {
                throw new Error("Tiger backend does not support subtotals.");
            }
        });
        const oppositeDimensions = dimensions.filter((dim0) => dim != dim0);
        // NOTE measureGroup is assumed to be correctly placed at at most one dimension (checked elsewhere)
        if (!oppositeDimensions.some(containsMeasureGroup)) {
            throw new Error(
                'Grand total must be defined opposite to some dimension containing "measure group".',
            );
        }
    }
}

function containsMeasureGroup(dim: IDimension): boolean {
    return dim.itemIdentifiers.includes(MeasureGroupIdentifier);
}

function convertTotalType(type: TotalType): GrandTotalFunctionEnum {
    if (type === "sum") {
        return GrandTotalFunctionEnum.SUM;
    }
    if (type === "max") {
        return GrandTotalFunctionEnum.MAX;
    }
    if (type === "min") {
        return GrandTotalFunctionEnum.MIN;
    }
    if (type === "avg") {
        return GrandTotalFunctionEnum.AVG;
    }
    if (type === "med") {
        return GrandTotalFunctionEnum.MED;
    }
    // type === "nat"
    throw new Error("Tiger backend does not support native totals.");
}
