// (C) 2026 GoodData Corporation

import { type DeclarativeComputedAttribute } from "@gooddata/api-client-tiger";
import type { ComputedAttribute } from "@gooddata/sdk-code-schemas/v1";

import { convertIdToTitle } from "../utils/sharedUtils.js";

/** @public */
export function yamlComputedAttributeToDeclarative(input: ComputedAttribute): DeclarativeComputedAttribute {
    // Assuming it's validated already by the `validate` command and all options are accounted for
    const output: DeclarativeComputedAttribute = {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        description: input.description ?? "",
        tags: input.tags ?? [],
        content: {
            maql: input.maql,
        },
    };

    // Optional fields are only sent when the yaml sets them, so the backend keeps applying its own
    // defaults (STRING/TEXT/UNSPECIFIED) instead of the convertor forcing them on every deploy.
    if (input.format !== undefined) {
        output.content.format = input.format;
    }
    if (input.metric_type !== undefined) {
        output.content.metricType = input.metric_type;
    }
    if (input.data_type !== undefined) {
        output.dataType = input.data_type;
    }
    if (input.value_type !== undefined) {
        output.valueType = input.value_type;
    }
    if (input.is_nullable !== undefined) {
        output.isNullable = input.is_nullable;
    }
    if (input.null_value_join_replacement !== undefined) {
        output.nullValue = input.null_value_join_replacement;
    }
    if (input.show_in_ai_results !== undefined) {
        output.isHidden = input.show_in_ai_results === false;
    }
    if (input.locale !== undefined) {
        output.locale = input.locale;
    }

    return output;
}
