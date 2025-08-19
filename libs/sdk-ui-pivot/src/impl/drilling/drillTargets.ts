// (C) 2007-2025 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
    getIntersectionAttributes,
} from "@gooddata/sdk-ui";

import { ColumnHeadersPosition, MeasureGroupDimension } from "../../publicTypes.js";

export function getAvailableDrillTargets(
    dv: DataViewFacade,
    measureGroupDimension?: MeasureGroupDimension,
    columnHeadersPosition?: ColumnHeadersPosition,
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
