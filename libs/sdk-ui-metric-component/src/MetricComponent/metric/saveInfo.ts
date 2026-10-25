// (C) 2022-2026 GoodData Corporation

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";

import { type SaveNameMode } from "../Content/EditMetricContent.data.js";
import { type FormField } from "../Form/data.js";

import { type IMeasureDef } from "./metricHelpers.js";

/**
 * @internal
 */
export interface ISaveMetricInfo {
    references: IMeasureReferencing;
    saveMode: SaveNameMode | undefined;
    formField: FormField | undefined;
    regenerateId: boolean | undefined;
    previousMetric: IMeasureDef;
}

export function createSaveMetricInfo(
    previous: IMeasureDef,
    references: IMeasureReferencing,
    saveMode?: SaveNameMode,
    regenerateId?: boolean,
    formField?: FormField,
): ISaveMetricInfo {
    return {
        saveMode,
        formField,
        regenerateId,
        references,
        previousMetric: { ...previous },
    };
}
