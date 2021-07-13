// (C) 2021 GoodData Corporation
import uniqBy from "lodash/fp/uniqBy";
import flatten from "lodash/flatten";
import { IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import {
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargets,
} from "../../vis/Events";
import { DataViewFacade } from "../../results/facade";

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
                        intersectionAttributes: attributes,
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
