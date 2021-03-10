// (C) 2007-2021 GoodData Corporation
import { IDimension, IExecutionDefinition, MeasureGroupIdentifier, TotalType } from "@gooddata/sdk-model";
import groupBy from "lodash/groupBy";
import flatMap from "lodash/flatMap";
import isEmpty from "lodash/isEmpty";
import keys from "lodash/keys";
import { GrandTotal, TotalFunction } from "@gooddata/api-client-tiger";

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
    validateTotals(def.dimensions);
    const allDimensionIndexes = def.dimensions.map((_dim, idx) => idx);
    return flatMap(def.dimensions, (dim, dimIdx) => {
        const totalsByType = groupBy(dim.totals || [], (total) => total.type);
        // (one-dimensional) grand total is defined in Tiger by all dimensions except the current one
        const includedDimensionIndexes = allDimensionIndexes.filter((idx) => dimIdx != idx);

        return keys(totalsByType).map((type) => {
            const measureIdentifiers = totalsByType[type].map((total) => total.measureIdentifier);
            const includedDimensionss = includedDimensionIndexes.map((includedDimIdx) => {
                const dim = def.dimensions[includedDimIdx];
                const dimensionAttributesValues = dim.itemIdentifiers.includes(MeasureGroupIdentifier)
                    ? { dimensionAttributesValues: { [MeasureGroupIdentifier]: measureIdentifiers } }
                    : null;
                // FIXME synchronize dimensionIdentifier naming with convertDimensions
                return { [`dim_${includedDimIdx}`]: dimensionAttributesValues };
            });

            return {
                localIdentifier: `total_${dimIdx}_${type}`,
                _function: convertTotalType(type as TotalType),
                includedDimensions: Object.assign({}, ...includedDimensionss),
            };
        });
    });
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

function convertTotalType(type: TotalType): TotalFunction {
    if (type === "sum") {
        return TotalFunction.SUM;
    }
    if (type === "max") {
        return TotalFunction.MAX;
    }
    if (type === "min") {
        return TotalFunction.MIN;
    }
    if (type === "avg") {
        return TotalFunction.AVG;
    }
    if (type === "med") {
        return TotalFunction.MED;
    }
    // type === "nat"
    throw new Error("Tiger backend does not support native totals.");
}
