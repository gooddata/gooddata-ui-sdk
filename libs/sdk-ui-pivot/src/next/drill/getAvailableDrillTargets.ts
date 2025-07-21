// (C) 2025 GoodData Corporation
import {
    DataViewFacade,
    getIntersectionAttributes,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-model";

/**
 * Calculate available drill targets for the pivot table next implementation.
 *
 * @param dv - Data view facade
 * @param measureGroupDimension - Whether measures are in columns or rows
 * @param columnHeadersPosition - Position of column headers
 * @returns Available drill targets
 * @alpha
 */
export function getAvailableDrillTargets(
    dv: DataViewFacade,
    measureGroupDimension: "columns" | "rows" = "columns",
    columnHeadersPosition: "left" | "top" = "top",
): IAvailableDrillTargets {
    const measureDescriptors = dv
        .meta()
        .measureDescriptors()
        .map(
            (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                measure,
                attributes: dv.meta().attributeDescriptors(),
            }),
        );

    const dimensionIndex = measureGroupDimension === "rows" && columnHeadersPosition === "left" ? 1 : 0;
    const attributeItems: IAvailableDrillTargetAttribute[] = dv
        .meta()
        .attributeDescriptorsForDim(dimensionIndex)
        .map((attribute, _index, attributes) => ({
            attribute,
            intersectionAttributes: getIntersectionAttributes(attribute, attributes),
        }));

    return {
        measures: measureDescriptors,
        attributes: attributeItems,
    };
}
