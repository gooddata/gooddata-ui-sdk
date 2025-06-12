// (C) 2020-2022 GoodData Corporation
import { IInsightDefinition, insightModifyItems } from "@gooddata/sdk-model";
import { fillMissingFormat } from "./fillMissingFormat.js";

/**
 * The function fills the format of the measures that does not have it set.
 *
 * @param insight - insight or insight definition that must be processed.
 *
 * @returns a copy of insight with auto-generated format for measures
 *
 * @internal
 */
export function fillMissingFormats<T extends IInsightDefinition>(insight: T): T {
    return insightModifyItems(insight, (item) => fillMissingFormat(item));
}
