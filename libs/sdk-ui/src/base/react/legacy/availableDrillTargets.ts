// (C) 2021-2025 GoodData Corporation

import { uniqBy } from "lodash-es";

import { IAttributeDescriptor, IMeasureDescriptor } from "@gooddata/sdk-model";

import { DataViewFacade } from "../../results/facade.js";
import {
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "../../vis/Events.js";

/**
 * @internal
 * Provides the subset of attributes which consist from all attributes before given attribute and attribute itself.
 * @param fromAttribute - attribute to which we want to get relevant intersection's attributes
 * @param attributes - all attributes from the same dimension as fromAttribute
 */
export function getIntersectionAttributes(
    fromAttribute: IAttributeDescriptor,
    attributes: IAttributeDescriptor[],
): IAttributeDescriptor[] {
    const indexOfFromAttribute = attributes.findIndex(
        (attribute) =>
            // to handle duplicated attributes in the same dimension
            attribute.attributeHeader.localIdentifier === fromAttribute.attributeHeader.localIdentifier,
    );

    return attributes.slice(0, indexOfFromAttribute + 1);
}

function getAvailableDrillAttributes(dv: DataViewFacade): IAvailableDrillTargetAttribute[] {
    return dv
        .meta()
        .dimensions()
        .flatMap((_dimension, index) => {
            return dv
                .meta()
                .attributeDescriptorsForDim(index)
                .map((attribute, _index, attributes) => ({
                    attribute,
                    intersectionAttributes: getIntersectionAttributes(attribute, attributes),
                }));
        });
}

export function getAvailableDrillTargets(dv: DataViewFacade): IAvailableDrillTargets {
    const meta = dv.meta();

    const attributes = uniqBy(
        meta.attributeDescriptors(),
        (attributeDescriptor: IAttributeDescriptor) => attributeDescriptor.attributeHeader.formOf.identifier,
    );

    return {
        measures: meta
            .measureDescriptors()
            .filter((measure: IMeasureDescriptor) => !meta.isVirtualMeasure(measure))
            .map(
                (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                    measure,
                    attributes,
                }),
            ),
        attributes: getAvailableDrillAttributes(dv),
    };
}
