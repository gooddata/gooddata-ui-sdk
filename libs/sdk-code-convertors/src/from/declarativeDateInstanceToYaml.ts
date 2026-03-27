// (C) 2023-2026 GoodData Corporation

import { Document } from "yaml";

import { type DeclarativeDateDataset } from "@gooddata/api-client-tiger";
import type { DateDataset } from "@gooddata/sdk-code-schemas/v1";

import { DATE_INSTANCE_COMMENT } from "../utils/texts.js";
import { entryWithSpace, fillOptionalMetaFields } from "../utils/yamlUtils.js";

/** @public */
export function declarativeDateInstanceToYaml(dataset: DeclarativeDateDataset): {
    content: string;
    json: DateDataset;
} {
    // Create new doc and add mandatory fields right away
    const doc = new Document({
        type: "date",
        id: dataset.id,
    });

    // Add intro comment to the document
    doc.commentBefore = DATE_INSTANCE_COMMENT;

    // Add optional meta fields
    fillOptionalMetaFields(doc, dataset);

    // Define and explain granularities
    doc.add(entryWithSpace("granularities", dataset.granularities));

    // Define formatting options if either one of them is set
    if (dataset.granularitiesFormatting.titlePattern || dataset.granularitiesFormatting.titleBase) {
        doc.add(entryWithSpace("title_base", dataset.granularitiesFormatting.titleBase ?? ""));
        doc.add(doc.createPair("title_pattern", dataset.granularitiesFormatting.titlePattern ?? ""));
    }

    return {
        content: doc.toString({
            lineWidth: 0,
        }),
        json: doc.toJSON() as DateDataset,
    };
}
