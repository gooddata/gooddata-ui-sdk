// (C) 2021-2026 GoodData Corporation

import { uniqBy } from "lodash-es";

import { type IAttributeDescriptor, type IMeasureDescriptor } from "@gooddata/sdk-model";

import { type DataViewFacade } from "../../results/facade.js";
import {
    type IAvailableDrillTargetAttribute,
    type IAvailableDrillTargetMeasure,
    type IAvailableDrillTargets,
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

/**
 * Builds available drill targets combining measures and attributes from multiple data views.
 * Used for multi-layer visualizations where each layer may have its own measures and attributes.
 *
 * @param layerDataViews - Array of DataViewFacades from all layers
 * @param primaryDataView - The primary layer's DataViewFacade (used as base)
 * @returns Combined available drill targets with measures and attributes from all layers
 * @internal
 */
export function getMultiLayerDrillTargets(
    layerDataViews: Array<DataViewFacade | null>,
    primaryDataView: DataViewFacade | null,
): IAvailableDrillTargets | undefined {
    if (!primaryDataView) {
        return undefined;
    }

    const primaryTargets = getAvailableDrillTargets(primaryDataView);
    const primaryMeasures = primaryTargets.measures ?? [];
    // Deduplicate primary attributes first (same attribute can appear in multiple buckets e.g. tooltip text)
    const primaryAttributes = uniqBy(
        primaryTargets.attributes ?? [],
        (a) => a.attribute.attributeHeader.formOf.identifier,
    );

    const allMeasures: IAvailableDrillTargetMeasure[] = [...primaryMeasures];
    const seenMeasureIds = new Set(primaryMeasures.map((m) => m.measure.measureHeaderItem.localIdentifier));

    const allAttributes: IAvailableDrillTargetAttribute[] = [...primaryAttributes];
    const seenAttributeIds = new Set(
        primaryAttributes.map((a) => a.attribute.attributeHeader.formOf.identifier),
    );

    for (const dataView of layerDataViews) {
        if (!dataView) {
            continue;
        }

        const layerTargets = getAvailableDrillTargets(dataView);

        // Collect unique measures from this layer
        for (const measureTarget of layerTargets.measures ?? []) {
            const measureId = measureTarget.measure.measureHeaderItem.localIdentifier;
            if (!seenMeasureIds.has(measureId)) {
                seenMeasureIds.add(measureId);
                allMeasures.push(measureTarget);
            }
        }

        // Collect unique attributes from this layer
        for (const attributeTarget of layerTargets.attributes ?? []) {
            const attributeId = attributeTarget.attribute.attributeHeader.formOf.identifier;
            if (!seenAttributeIds.has(attributeId)) {
                seenAttributeIds.add(attributeId);
                allAttributes.push(attributeTarget);
            }
        }
    }

    return {
        ...primaryTargets,
        attributes: allAttributes,
        measures: allMeasures,
    };
}
