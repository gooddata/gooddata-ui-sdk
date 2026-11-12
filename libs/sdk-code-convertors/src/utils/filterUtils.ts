// (C) 2023-2026 GoodData Corporation

import type { AttributeFilter, DateDataset, DateFilter } from "@gooddata/sdk-code-schemas/v1";
import type { MatchFilterOperator } from "@gooddata/sdk-model";

import { type ExportEntities, type FromEntities } from "../types.js";

import { convertGranularityToId, parseGranularityValue } from "./granularityUtils.js";
import type { TextFilterCondition } from "./typeGuards.js";

/**
 * Returns the granularity id when `label` is a label of a date dataset known to `entities` (and the dataset
 * offers that granularity), otherwise undefined.
 */
function findDateLabelGranularity(entities: FromEntities | ExportEntities, label: string) {
    const [type, objId] = label.split("/");
    const id = objId || type;
    const [dateDatasetId, gran] = id.split(".");

    const dateDatasetEntity = entities.find((e) => e.type === "date" && e.id === dateDatasetId);
    if (dateDatasetEntity?.data) {
        const dateDataset = dateDatasetEntity.data as DateDataset;
        return dateDataset.granularities?.map((g) => convertGranularityToId(g)).find((g) => g === gran);
    }
    return undefined;
}

export function parseDateValues(
    entities: FromEntities | ExportEntities,
    label: string,
    values: (string | number | boolean)[],
) {
    const gran = findDateLabelGranularity(entities, label);
    return gran ? convertDateValues(gran, values) : values;
}

/**
 * Parses the values of an attribute filter in the YAML to declarative direction like
 * {@link parseDateValues}, but an empty string `""` in the values of a date label is turned into `null`, the
 * way the UI represents the "(empty value)" element. A date label never holds `""`, while the backend
 * treats `""` and `null` alike on it, so this is lossless there. Labels of ordinary attributes keep their
 * values untouched, as `""` and `null` are distinct values for them.
 *
 * It has to run after the legacy `""` marker filter is folded into `empty_values`
 * ({@link foldLegacyEmptyValuesWithFilter}), so that marker never reaches it.
 */
export function parseDateValuesToDeclarative(
    entities: FromEntities | ExportEntities,
    label: string,
    values: (string | number | boolean)[],
) {
    const gran = findDateLabelGranularity(entities, label);
    if (!gran) {
        return values;
    }

    // value by value, as a granularity specific parsing would drop the "" which is to be kept
    return values.flatMap((value) => (value === "" ? [null] : convertDateValues(gran, [value])));
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

/**
 * Before the date filter carried its own `empty_values`, the mode was stored as an attribute filter on the
 * date label with the single value `""`: `include` meant "only", `exclude` meant "exclude". Pull and AD
 * still read that shape; deploy must not write it, because the backend executes it next to the date
 * filter's default of excluding empty values, and the two cancel out.
 *
 * Returns the date filter with such a `with:` entry folded into `empty_values` and removed. An explicit
 * `empty_values` wins, the entry is dropped either way. A `""` mixed with other values, or on a label
 * that is not of the date filter's dataset, or several `""` markers, is an ordinary filter and stays.
 */
export function foldLegacyEmptyValuesWithFilter(filter: DateFilter): DateFilter {
    const withFilters = filter.with;
    if (!withFilters) {
        return filter;
    }

    const datasetId = filter.using.split("/").pop();
    const legacy = Object.entries(withFilters).flatMap(([key, withFilter]) => {
        const mode = legacyEmptyValuesMode(withFilter, datasetId);
        return mode ? [{ key, mode }] : [];
    });
    // Two markers on one date filter have no single mode to fold into, so none is folded
    if (legacy.length !== 1) {
        return filter;
    }

    const legacyKeys = new Set(legacy.map(({ key }) => key));
    const remaining = Object.fromEntries(Object.entries(withFilters).filter(([key]) => !legacyKeys.has(key)));
    const { with: _with, ...rest } = filter;

    return {
        ...rest,
        ...(Object.keys(remaining).length > 0 ? { with: remaining } : {}),
        ...(filter.empty_values ? {} : { empty_values: legacy[0].mode }),
    };
}

function legacyEmptyValuesMode(
    filter: AttributeFilter,
    datasetId: string | undefined,
): "only" | "exclude" | undefined {
    // A date label id is `<dataset id>.<granularity>`; the dataset id may itself contain dots, so compare
    // it whole rather than up to the first dot.
    const labelId = filter.using.split("/").pop() ?? "";
    const granularity =
        datasetId && labelId.startsWith(`${datasetId}.`) ? labelId.slice(datasetId.length + 1) : "";
    if (!granularity || granularity.includes(".")) {
        return undefined;
    }

    const isOnlyEmpty = (values: unknown[] | undefined) => values?.length === 1 && values[0] === "";
    if (isOnlyEmpty(filter.state?.include)) {
        return "only";
    }
    return isOnlyEmpty(filter.state?.exclude) ? "exclude" : undefined;
}
