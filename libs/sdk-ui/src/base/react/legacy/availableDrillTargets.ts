// (C) 2021-2022 GoodData Corporation
import uniqBy from "lodash/fp/uniqBy.js";
import flatten from "lodash/flatten.js";
import { IMeasureDescriptor, IAttributeDescriptor } from "@gooddata/sdk-model";
import {
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "../../vis/Events.js";
import { DataViewFacade } from "../../results/facade.js";

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
    return flatten(
        dv
            .meta()
            .dimensions()
            .map((_dimension, index) => {
                return dv
                    .meta()
                    .attributeDescriptorsForDim(index)
                    .map((attribute, _index, attributes) => ({
                        attribute,
                        intersectionAttributes: getIntersectionAttributes(attribute, attributes),
                    }));
            }),
    );
}

export function getAvailableDrillTargets(dv: DataViewFacade): IAvailableDrillTargets {
    const attributes = uniqBy(
        (attributeDescriptor) => attributeDescriptor.attributeHeader.formOf.identifier,
        dv.meta().attributeDescriptors(),
    );
    return {
        measures: dv
            .meta()
            .measureDescriptors()
            .map(
                (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                    measure,
                    attributes,
                }),
            ),
        attributes: getAvailableDrillAttributes(dv),
    };
}
