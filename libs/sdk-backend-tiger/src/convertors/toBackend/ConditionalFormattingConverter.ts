// (C) 2026 GoodData Corporation

import { type JsonApiVisualizationObjectInAttributesConditionalFormatting } from "@gooddata/api-client-tiger";
import { NotSupported } from "@gooddata/sdk-backend-spi";
import {
    type ConditionalFormattingValue,
    type IConditionalFormatting,
    type IConditionalFormattingRule,
    type IInsightDefinition,
    insightProperties,
} from "@gooddata/sdk-model";

import { toTigerGranularity } from "../fromBackend/dateGranularityConversions.js";

/**
 * Projects the insight's conditional formatting (persisted free-form under
 * `properties.controls.conditionalFormatting`) into the typed visualizationObject entity attribute.
 *
 * Dual-write: `content` — which still carries the same rules inside `properties` — stays
 * authoritative; this typed attribute is a parallel, server-validated projection that readers switch
 * to later. Two boundary guarantees:
 * - Returns `null` (never `undefined`) when there is no formatting, so the PUT body explicitly clears
 *   the projection rather than relying on the server's omitted-attribute semantics — otherwise a
 *   cleared CF could leave a stale typed projection diverging from the authoritative `content`.
 * - A malformed blob (`content` is free-form and unvalidated) also degrades to `null`: the projection
 *   must never break a save, since `content` remains the source of truth.
 *
 * `version` and `customTargets` are intentionally NOT carried — the typed schema does not model them
 * yet, and `content` stays authoritative until the switch, so nothing is lost. This is an allow-list:
 * a field added to {@link IConditionalFormatting} will not auto-propagate; extend this projection (and
 * its test) when the typed schema grows.
 *
 * The projection is a structural copy except for relative-date granularities, which the SDK stores in
 * its own vocabulary (`GDC.time.*`) while the typed schema uses tiger's (`YEAR`, `MONTH_OF_YEAR`, ...);
 * those are translated via the canonical granularity mapping, and a granularity tiger does not model
 * degrades the projection to `null` like any other malformed-blob case.
 */
export function convertConditionalFormatting(
    insight: IInsightDefinition,
): JsonApiVisualizationObjectInAttributesConditionalFormatting | null {
    const conditionalFormatting: IConditionalFormatting | undefined =
        insightProperties(insight)["controls"]?.["conditionalFormatting"];
    if (
        !conditionalFormatting ||
        !Array.isArray(conditionalFormatting.rules) ||
        conditionalFormatting.rules.some(
            (rule) =>
                !Array.isArray(rule?.conditions) ||
                rule.conditions.some((condition: unknown) => !condition || typeof condition !== "object"),
        )
    ) {
        return null;
    }
    // Array.isArray() narrows the readonly rules array to any[]; re-annotate to keep element types.
    const rules: readonly IConditionalFormattingRule[] = conditionalFormatting.rules;
    try {
        return {
            enabled: conditionalFormatting.enabled,
            rules: rules.map((rule) => ({
                id: rule.id,
                target: rule.target,
                conditions: rule.conditions.map((condition) => ({
                    id: condition.id,
                    operator: condition.operator,
                    value: convertValue(condition.value),
                    format: condition.format,
                })),
            })),
        };
    } catch (error) {
        // toTigerGranularity throws NotSupported for a granularity the free-form blob may carry but
        // tiger does not model; the projection degrades like any other malformed-blob case.
        if (error instanceof NotSupported) {
            return null;
        }
        throw error;
    }
}

function convertValue(value: ConditionalFormattingValue) {
    if (value.kind === "relativeDate") {
        return {
            kind: value.kind,
            granularity: toTigerGranularity(value.granularity),
            from: value.from,
            to: value.to,
        };
    }
    return value;
}
