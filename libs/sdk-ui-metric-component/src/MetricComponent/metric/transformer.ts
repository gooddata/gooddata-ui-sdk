// (C) 2023-2026 GoodData Corporation

import { type IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { getMaqlValue } from "../Form/maqlFieldFunctions.js";

import { addPrefixToId } from "./prefixHelper.js";

export function transformToMetricDefinition(
    data: IMeasureMetadataObjectDefinition & { prefix?: string },
): IMeasureMetadataObjectDefinition {
    const metric = { ...data };
    const prefix = metric.prefix;
    delete metric.prefix;

    return {
        ...metric,
        expression: getMaqlValue(metric.expression),
        ...(metric.id && prefix
            ? {
                  id: addPrefixToId(prefix, metric.id),
              }
            : {}),
    };
}
