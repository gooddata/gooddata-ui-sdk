// (C) 2023-2026 GoodData Corporation

import { type DeclarativeDateDataset } from "@gooddata/api-client-tiger";

import type { DateDataset } from "../schemas/v1/metadata.js";
import { convertGranularityToDeclarativeDatasetGranularity } from "../utils/granularityUtils.js";
import { convertIdToTitle } from "../utils/sharedUtils.js";

/** @public */
export function yamlDateDatesetToDeclarative(input: DateDataset): DeclarativeDateDataset {
    // Assuming it's validated already by the `validate` command and all options are accounted for
    return {
        id: input.id,
        title: input.title ?? convertIdToTitle(input.id),
        description: input.description ?? "",
        tags: input.tags ?? [],
        granularities: (input.granularities ?? [])
            .map(convertGranularityToDeclarativeDatasetGranularity)
            .filter((value, index, array) => array.indexOf(value) === index),
        granularitiesFormatting: {
            titleBase: input.title_base ?? "",
            titlePattern: input.title_pattern ?? "",
        },
    };
}
