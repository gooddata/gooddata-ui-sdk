// (C) 2007-2022 GoodData Corporation
import {
    DataViewFacade,
    getIntersectionAttributes,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-model";

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
