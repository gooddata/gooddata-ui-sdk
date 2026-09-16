// (C) 2026 GoodData Corporation

import { v4 as uuid } from "uuid";

import {
    type JsonApiMetricInAttributesConditionalFormatting as TigerConditionalFormatting,
    type ConditionalFormattingValue as TigerConditionalFormattingValue,
} from "@gooddata/api-client-tiger";
import {
    type ConditionalFormattingValue,
    type DateFilterGranularity,
    type ISemanticConditionalFormatting,
    isDateFilterGranularity,
} from "@gooddata/sdk-model";

import { toSdkGranularity, toTigerGranularity } from "./dateGranularityConversions.js";

// The wire shape equals the SDK model except for the relative-date granularity vocabulary. A wire
// granularity outside DateFilterGranularity degrades to "GDC.time.date" (see toSdkGranularity).
const FALLBACK_GRANULARITY: DateFilterGranularity = "GDC.time.date";

function toTigerValue(value: ConditionalFormattingValue): TigerConditionalFormattingValue {
    return value.kind === "relativeDate"
        ? { ...value, granularity: toTigerGranularity(value.granularity) }
        : value;
}

function fromTigerValue(value: TigerConditionalFormattingValue): ConditionalFormattingValue {
    if (value.kind !== "relativeDate") {
        return value;
    }
    const granularity = toSdkGranularity(value.granularity);
    return {
        ...value,
        granularity: isDateFilterGranularity(granularity) ? granularity : FALLBACK_GRANULARITY,
    };
}

/**
 * Converts semantic-layer conditional formatting to the metadata-api wire shape.
 */
export function toTigerConditionalFormatting(
    conditionalFormatting: ISemanticConditionalFormatting,
): TigerConditionalFormatting {
    return {
        enabled: conditionalFormatting.enabled ?? true,
        conditions: conditionalFormatting.conditions.map((condition) => ({
            ...condition,
            value: toTigerValue(condition.value),
        })),
    };
}

/**
 * Converts metadata-api wire conditional formatting back to the SDK model. A wire condition without
 * an `id` (another API client may not assign one) gets a fresh client-side one.
 */
export function fromTigerConditionalFormatting(
    conditionalFormatting: TigerConditionalFormatting,
): ISemanticConditionalFormatting;
export function fromTigerConditionalFormatting(
    conditionalFormatting: TigerConditionalFormatting | null | undefined,
): ISemanticConditionalFormatting | undefined;
export function fromTigerConditionalFormatting(
    conditionalFormatting: TigerConditionalFormatting | null | undefined,
): ISemanticConditionalFormatting | undefined {
    if (!conditionalFormatting) {
        return undefined;
    }
    return {
        enabled: conditionalFormatting.enabled,
        conditions: conditionalFormatting.conditions.map((condition) => ({
            ...condition,
            id: condition.id ?? uuid(),
            value: fromTigerValue(condition.value),
        })),
    };
}

/**
 * The `conditionalFormatting` part of a partial PATCH: omitted leaves the stored value untouched,
 * `null` clears it.
 */
export function toTigerConditionalFormattingPatch(
    conditionalFormatting: ISemanticConditionalFormatting | null | undefined,
): { conditionalFormatting?: TigerConditionalFormatting | null } {
    if (conditionalFormatting === undefined) {
        return {};
    }
    return {
        conditionalFormatting: conditionalFormatting
            ? toTigerConditionalFormatting(conditionalFormatting)
            : null,
    };
}
