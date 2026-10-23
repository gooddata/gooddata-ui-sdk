// (C) 2021-2026 GoodData Corporation

import {
    type IMeasure,
    type IMeasureMetadataObjectDefinition,
    modifyInlineMeasure,
    newInlineMeasure,
} from "@gooddata/sdk-model";

export function createInlineMeasure(
    metric: IMeasureMetadataObjectDefinition,
    emptyTitle?: string,
): IMeasure | null {
    return metric.expression
        ? modifyInlineMeasure(newInlineMeasure(metric.expression), (m) => {
              m.title(metric.title || emptyTitle);
              m.format(metric.format);
              return m;
          })
        : null;
}
