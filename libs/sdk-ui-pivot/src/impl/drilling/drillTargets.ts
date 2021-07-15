// (C) 2007-2021 GoodData Corporation
import {
    DataViewFacade,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import { IMeasureDescriptor, IAttributeDescriptor } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual } from "@gooddata/sdk-model";

function getIntersectionAttributes(
    fromAttribute: IAttributeDescriptor,
    attributes: IAttributeDescriptor[],
): IAttributeDescriptor[] {
    const indexOfFromAttribute = attributes.findIndex((attribute) =>
        areObjRefsEqual(attribute.attributeHeader.ref, fromAttribute.attributeHeader.ref),
    );

    return attributes.slice(0, indexOfFromAttribute + 1);
}

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
