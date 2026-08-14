// (C) 2026 GoodData Corporation

import { type IAttributeDescriptor, type IMeasureDescriptor } from "@gooddata/sdk-model";

import {
    type ConditionalFormattingTarget,
    type IConditionalFormatting,
    type IConditionalFormattingRule,
} from "../../types/conditionalFormatting.js";

function targetKey(target: ConditionalFormattingTarget): string {
    return target.kind === "attribute"
        ? `attribute:${target.attributeIdentifier}`
        : `measure:${target.measureIdentifier}`;
}

function materializeSemanticRules(
    attributeDescriptors: readonly IAttributeDescriptor[],
    measureDescriptors: readonly IMeasureDescriptor[],
): IConditionalFormattingRule[] {
    const attributeRules = attributeDescriptors.flatMap((descriptor): IConditionalFormattingRule[] => {
        const conditionalFormatting = descriptor.attributeHeader.conditionalFormatting;
        if (!conditionalFormatting) {
            return [];
        }
        return [
            {
                id: `semantic:attribute:${descriptor.attributeHeader.localIdentifier}`,
                target: {
                    kind: "attribute",
                    attributeIdentifier: descriptor.attributeHeader.localIdentifier,
                },
                conditions: conditionalFormatting.conditions,
            },
        ];
    });
    const measureRules = measureDescriptors.flatMap((descriptor): IConditionalFormattingRule[] => {
        const conditionalFormatting = descriptor.measureHeaderItem.conditionalFormatting;
        if (!conditionalFormatting) {
            return [];
        }
        return [
            {
                id: `semantic:measure:${descriptor.measureHeaderItem.localIdentifier}`,
                target: { kind: "measure", measureIdentifier: descriptor.measureHeaderItem.localIdentifier },
                conditions: conditionalFormatting.conditions,
            },
        ];
    });
    return [...attributeRules, ...measureRules];
}

/**
 * Blends the insight's own conditional-formatting config with rules inherited from the semantic
 * layer (carried on the execution result's attribute/measure descriptors), resolving Inherited vs
 * Custom per target. Returns an ordinary {@link IConditionalFormatting} that the rest of the
 * engine (trigger resolution, date-bounds resolution, evaluation) consumes unmodified.
 *
 * @internal
 */
export function resolvePerTargetConditionalFormatting(
    insightConfig: IConditionalFormatting | undefined,
    attributeDescriptors: readonly IAttributeDescriptor[],
    measureDescriptors: readonly IMeasureDescriptor[],
): IConditionalFormatting | undefined {
    const semanticRules = materializeSemanticRules(attributeDescriptors, measureDescriptors);
    if (semanticRules.length === 0) {
        return insightConfig;
    }

    // `enabled` predates per-target Inherited/Custom and only ever meant "my authored rules are
    // active" — it must not also suppress targets the creator never touched (that's what
    // `customTargets` is for). A Custom target (has an authored rule) whose rules are inactive
    // shows nothing rather than silently falling back to its inherited rule: `customModeTargets`
    // is built from ALL authored rules regardless of `enabled`, so a disabled target stays
    // excluded from inheritance even though its (inactive) rule is excluded from the merge below.
    const allInsightRules = insightConfig?.rules ?? [];
    const activeInsightRules = insightConfig?.enabled ? allInsightRules : [];
    const customModeTargets = new Set([
        ...allInsightRules.map((rule) => targetKey(rule.target)),
        ...(insightConfig?.customTargets ?? []).map(targetKey),
    ]);
    const inheritedRules = semanticRules.filter((rule) => !customModeTargets.has(targetKey(rule.target)));

    const mergedRules = [...activeInsightRules, ...inheritedRules];
    if (mergedRules.length === 0) {
        return undefined;
    }

    return {
        version: insightConfig?.version,
        enabled: true,
        rules: mergedRules,
        customTargets: insightConfig?.customTargets,
    };
}
