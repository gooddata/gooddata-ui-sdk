// (C) 2026 GoodData Corporation

import { type DeclarativeComputedAttribute } from "@gooddata/api-client-tiger";
import type { ComputedAttribute } from "@gooddata/sdk-code-schemas/v1";

import { convertIdToTitle } from "../utils/sharedUtils.js";

/**
 * A computed attribute is textual for now: the backend does not transfer the value type from
 * metadata yet, so every computed attribute is interpreted as a STRING/TEXT one. The YAML shape
 * therefore does not expose dataType/valueType and the defaults are filled in here.
 */
const DEFAULT_DATA_TYPE = "STRING";
const DEFAULT_VALUE_TYPE = "TEXT";

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
        dataType: DEFAULT_DATA_TYPE,
        valueType: DEFAULT_VALUE_TYPE,
    };

    if (input.locale !== undefined) {
        output.locale = input.locale;
    }

    return output;
}
