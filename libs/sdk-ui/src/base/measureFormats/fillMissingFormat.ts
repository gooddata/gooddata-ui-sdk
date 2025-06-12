// (C) 2020-2022 GoodData Corporation
import {
    isSimpleMeasure,
    IAttributeOrMeasure,
    measureDoesComputeRatio,
    measureFormat,
    modifySimpleMeasure,
} from "@gooddata/sdk-model";

const DEFAULT_PERCENTAGE_FORMAT = "#,##0.00%";

/**
 * The function fills the format of the measure bucket item that does not have it set.
 *
 * @param item - bucket attribute or measure
 *
 * @returns a copy of bucket item with auto-generated format for measure
 *
 * @internal
 */
export function fillMissingFormat(item: IAttributeOrMeasure): IAttributeOrMeasure {
    if (isSimpleMeasure(item)) {
        const doesCompateRatio = measureDoesComputeRatio(item);
        const format = measureFormat(item);

        if (!format && doesCompateRatio) {
            return modifySimpleMeasure(item, (measure) => measure.format(DEFAULT_PERCENTAGE_FORMAT));
        }
    }
    return item;
}
