// (C) 2023-2026 GoodData Corporation

import { type DeclarativeMetric } from "@gooddata/api-client-tiger";

import type { Metric } from "../schemas/v1/metadata.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

/** @public */
export function yamlMetricToDeclarative(input: Metric): DeclarativeMetric {
    // Assuming it's validated already by the `validate` command and all options are accounted for
    const output: DeclarativeMetric = {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        description: input.description ?? "",
        tags: input.tags ?? [],
        content: {
            maql: input.maql,
            format: input.format,
        },
    };

    if (input.is_hidden !== undefined) {
        output.isHidden = input.is_hidden;
    }
    if (input.show_in_ai_results !== undefined) {
        output.isHidden = input.show_in_ai_results === false;
    }

    return output;
}
