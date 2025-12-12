// (C) 2019-2025 GoodData Corporation
import { type IMeasureDimensionInfo } from "./collectMeasureDimensionMeta.js";

/**
 * @internal
 */
export type ITranspositionInfo = {
    isTransposed: boolean;
};

/**
 * @internal
 */
export function collectTranspositionInfo({ hasMeasures, measureDimension }: IMeasureDimensionInfo) {
    const isTransposed = hasMeasures && measureDimension === "rows";

    return {
        isTransposed,
    };
}
