// (C) 2007-2021 GoodData Corporation
import {
    DataViewFacade,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";

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
            intersectionAttributes: attributes,
        }));

    return {
        measures: measureDescriptors,
        attributes: rowAttributeItems,
    };
}
