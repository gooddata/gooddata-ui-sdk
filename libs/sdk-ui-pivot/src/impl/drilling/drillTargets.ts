// (C) 2007-2021 GoodData Corporation
import { DataViewFacade, IAvailableDrillTargetMeasure, IAvailableDrillTargets } from "@gooddata/sdk-ui";
import {
    IAttributeDescriptor,
    IDimensionDescriptor,
    IExecutionResult,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-backend-spi";
import { flow, flatMap, filter } from "lodash/fp";

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

    const rowAttributeItems = dv
        .meta()
        .attributeDescriptorsForDim(0)
        .map((attribute: IAttributeDescriptor) => ({
            attribute,
        }));

    return {
        measures: measureDescriptors,
        attributes: rowAttributeItems,
    };
}

export function getAvailableDrillTargetsFromExecutionResult(
    executionResult: IExecutionResult,
): IAvailableDrillTargets {
    const attributeDescriptors: IAttributeDescriptor[] = flow(
        flatMap((dimensionDescriptor: IDimensionDescriptor) => dimensionDescriptor.headers),
        filter(isAttributeDescriptor),
    )(executionResult.dimensions);

    const measureDescriptors: IMeasureDescriptor[] = flow(
        flatMap((dimensionDescriptor: IDimensionDescriptor) => dimensionDescriptor.headers),
        filter(isMeasureGroupDescriptor),
        flatMap(
            (measureGroupDescriptor: IMeasureGroupDescriptor) =>
                measureGroupDescriptor.measureGroupHeader.items,
        ),
    )(executionResult.dimensions);

    return {
        measures: measureDescriptors.map(
            (measure: IMeasureDescriptor): IAvailableDrillTargetMeasure => ({
                measure,
                attributes: attributeDescriptors,
            }),
        ),
    };
}
