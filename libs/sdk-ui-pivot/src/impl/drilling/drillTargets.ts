// (C) 2007-2022 GoodData Corporation
import {
    DataViewFacade,
    getIntersectionAttributes,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-model";

export function getAvailableDrillTargets(dv: DataViewFacade): IAvailableDrillTargets {
    const measureDescriptors = dv
        .meta()
        .measureDescriptors()
        .map(
            (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                measure,
                attributes: dv.meta().attributeDescriptors(),
            }),
        );

    const rowAttributeItems: IAvailableDrillTargetAttribute[] = dv
        .meta()
        .attributeDescriptorsForDim(0)
        .map((attribute, _index, attributes) => ({
            attribute,
            intersectionAttributes: getIntersectionAttributes(attribute, attributes),
        }));

    return {
        measures: measureDescriptors,
        attributes: rowAttributeItems,
    };
}
