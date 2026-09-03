// (C) 2007-2026 GoodData Corporation

import { type IMeasureDescriptor, attributeLocalId, isComputedAttribute } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IAvailableDrillTargetAttribute,
    type IAvailableDrillTargetMeasure,
    type IAvailableDrillTargets,
    getIntersectionAttributes,
} from "@gooddata/sdk-ui";

import { type ColumnHeadersPosition, type MeasureGroupDimension } from "../../publicTypes.js";

export function getAvailableDrillTargets(
    dv: DataViewFacade,
    measureGroupDimension?: MeasureGroupDimension,
    columnHeadersPosition?: ColumnHeadersPosition,
): IAvailableDrillTargets {
    const measureDescriptors = dv
        .meta()
        .measureDescriptors()
        .map((measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
            measure,
            attributes: dv.meta().attributeDescriptors(),
        }));

    const computedAttributeLocalIds = new Set(
        dv.def().attributes().filter(isComputedAttribute).map(attributeLocalId),
    );
    const dimensionIndex = measureGroupDimension === "rows" && columnHeadersPosition === "left" ? 1 : 0;
    const attributeItems: IAvailableDrillTargetAttribute[] = dv
        .meta()
        .attributeDescriptorsForDim(dimensionIndex)
        .map((attribute, _index, attributes) => ({
            attribute,
            intersectionAttributes: getIntersectionAttributes(attribute, attributes),
        }))
        .filter((item) => !computedAttributeLocalIds.has(item.attribute.attributeHeader.localIdentifier));

    return {
        measures: measureDescriptors,
        attributes: attributeItems,
    };
}
