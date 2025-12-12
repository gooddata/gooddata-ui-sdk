// (C) 2019-2025 GoodData Corporation
import { type IResultMeasureHeader } from "@gooddata/sdk-model";

/**
 * @internal
 */
export function getMeasureHeaderValue(measureHeader: IResultMeasureHeader): string {
    return measureHeader.measureHeaderItem.name;
}
