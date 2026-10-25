// (C) 2022-2026 GoodData Corporation

import { type IMeasureReferencing } from "@gooddata/sdk-backend-spi";

/**
 * @internal
 */
export interface IDeleteMetricInfo {
    references: IMeasureReferencing;
}

export function createDeleteMetricInfo(references: IMeasureReferencing): IDeleteMetricInfo {
    return {
        references,
    };
}
