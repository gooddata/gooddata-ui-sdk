// (C) 2022 GoodData Corporation

import { BucketNames } from "@gooddata/sdk-ui";
import { IAxisConfig } from "@gooddata/sdk-ui-charts";

import { IReferencePoint } from "../../../interfaces/Visualization.js";
import { getBucketItems } from "../../../utils/bucketHelper.js";

function areAllMeasuresOnSingleAxis(
    buckets: IReferencePoint["buckets"],
    secondaryAxis: IAxisConfig,
): boolean {
    const measures = getBucketItems(buckets, BucketNames.MEASURES);
    const measureCount = measures.length;
    const numberOfMeasureOnSecondaryAxis = secondaryAxis.measures?.length ?? 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

export function canSortStackTotalValue(
    buckets: IReferencePoint["buckets"],
    properties: IReferencePoint["properties"],
): boolean {
    const supportedControls = properties?.controls;
    const stackMeasures = supportedControls?.stackMeasures ?? false;
    const secondaryAxis: IAxisConfig = supportedControls?.secondary_xaxis ?? { measures: [] };
    const allMeasuresOnSingleAxis = areAllMeasuresOnSingleAxis(buckets, secondaryAxis);

    return stackMeasures && allMeasuresOnSingleAxis;
}
