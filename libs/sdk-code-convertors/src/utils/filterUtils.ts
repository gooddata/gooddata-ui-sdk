// (C) 2023-2026 GoodData Corporation

import type { DateDataset } from "@gooddata/sdk-code-schemas/v1";
import type { MatchFilterOperator } from "@gooddata/sdk-model";

import { type ExportEntities, type FromEntities } from "../types.js";

import { convertGranularityToId, parseGranularityValue } from "./granularityUtils.js";
import type { TextFilterCondition } from "./typeGuards.js";

export function parseDateValues(
    entities: FromEntities | ExportEntities,
    label: string,
    values: (string | number | boolean)[],
) {
    const [type, objId] = label.split("/");
    const id = objId || type;
    const [dateDatasetId, gran] = id.split(".");

    const dateDatasetEntity = entities.find((e) => e.type === "date" && e.id === dateDatasetId);
    if (dateDatasetEntity?.data) {
        const dateDataset = dateDatasetEntity.data as DateDataset;
        const exists = dateDataset.granularities
            ?.map((g) => convertGranularityToId(g))
            .find((g) => g === gran);

        if (exists) {
            return convertDateValues(gran, values);
        }
    }
    return values;
}

export function matchConditionToYaml(operator: MatchFilterOperator, negativeSelection?: boolean): string {
    if (!negativeSelection) {
        return operator;
    }

    const negativeOperatorMap: Record<MatchFilterOperator, string> = {
        contains: "doesNotContain",
        startsWith: "doesNotStartWith",
        endsWith: "doesNotEndWith",
    };

    return negativeOperatorMap[operator];
}

export function yamlConditionToMatch(condition: TextFilterCondition): {
    operator: MatchFilterOperator;
    negativeSelection: boolean;
} {
    const conditionMap: Partial<
        Record<TextFilterCondition, { operator: MatchFilterOperator; negativeSelection: boolean }>
    > = {
        contains: { operator: "contains", negativeSelection: false },
        doesNotContain: { operator: "contains", negativeSelection: true },
        startsWith: { operator: "startsWith", negativeSelection: false },
        doesNotStartWith: { operator: "startsWith", negativeSelection: true },
        endsWith: { operator: "endsWith", negativeSelection: false },
        doesNotEndWith: { operator: "endsWith", negativeSelection: true },
    };

    const mappedCondition = conditionMap[condition];
    if (!mappedCondition) {
        throw new Error(`Unsupported match filter condition: ${condition}`);
    }

    return mappedCondition;
}

function convertDateValues(gran: string, values: (string | number | boolean)[]) {
    const granularity = gran as ReturnType<typeof convertGranularityToId>;
    // Filter out null/undefined but preserve empty strings which are valid attribute values
    return values
        .map((v) => parseGranularityValue(granularity, v))
        .filter((v) => v !== null && v !== undefined);
}
