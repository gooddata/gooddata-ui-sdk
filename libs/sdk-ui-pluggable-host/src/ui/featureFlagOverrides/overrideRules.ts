// (C) 2026 GoodData Corporation

import {
    type FeatureFlagOverrideRule,
    type IFeatureFlagOverrideContext,
    type IStaleFeatureFlagOverrideRule,
    LocalFeatureFlagOverrides,
    type OverridableFeatureFlag,
    TigerFeatureDefinitions,
    isOverridableFeatureFlag,
    isValidFeatureFlagValue,
    selectFeatureFlagOverrideRules,
} from "@gooddata/sdk-backend-tiger";
import { type IUser } from "@gooddata/sdk-model";

export type OverrideScope = "everywhere" | "organization" | "workspace";

export interface IOverrideTarget {
    scope: OverrideScope;
    onlyMe: boolean;
}

export const DEFAULT_OVERRIDE_TARGET: IOverrideTarget = { scope: "everywhere", onlyMe: false };

export type OverrideValue<K extends OverridableFeatureFlag = OverridableFeatureFlag> =
    FeatureFlagOverrideRule<K>["value"];

export type FlagType = (typeof TigerFeatureDefinitions)[OverridableFeatureFlag]["type"];

interface IOverrideRuleIdentity extends IFeatureFlagOverrideContext {
    flag: OverridableFeatureFlag;
}

export interface IOverrideRuleChange {
    flag: OverridableFeatureFlag;
    value: unknown;
    conditions: IFeatureFlagOverrideContext;
}

export const OVERRIDABLE_FLAGS: readonly OverridableFeatureFlag[] = Object.keys(TigerFeatureDefinitions)
    .filter(isOverridableFeatureFlag)
    .sort((a, b) => a.localeCompare(b));

export function getRuleTarget(rule: IFeatureFlagOverrideContext): IOverrideTarget {
    const scope: OverrideScope =
        rule.workspaceId === undefined
            ? rule.organizationId === undefined
                ? "everywhere"
                : "organization"
            : "workspace";
    return { scope, onlyMe: rule.userId !== undefined };
}

export function getRuleConditions({
    organizationId,
    workspaceId,
    userId,
}: FeatureFlagOverrideRule): IFeatureFlagOverrideContext {
    return {
        ...(organizationId === undefined ? {} : { organizationId }),
        ...(workspaceId === undefined ? {} : { workspaceId }),
        ...(userId === undefined ? {} : { userId }),
    };
}

/**
 * A workspace rule also stores the organization when the context has one, so it does not apply to
 * a workspace with the same ID in another organization.
 */
export function getTargetConditions(
    target: IOverrideTarget,
    context: IFeatureFlagOverrideContext,
): IFeatureFlagOverrideContext {
    const withOrganization = target.scope === "organization" || target.scope === "workspace";
    return {
        ...(withOrganization && context.organizationId ? { organizationId: context.organizationId } : {}),
        ...(target.scope === "workspace" && context.workspaceId ? { workspaceId: context.workspaceId } : {}),
        ...(target.onlyMe && context.userId ? { userId: context.userId } : {}),
    };
}

export function createRule({
    flag,
    value,
    conditions,
}: IOverrideRuleChange): FeatureFlagOverrideRule | undefined {
    if (!isValidFeatureFlagValue(flag, value)) {
        return undefined;
    }
    // The check above fits the value to the flag; TS cannot narrow the rule union by a flag variable.
    return { flag, value, ...conditions } as FeatureFlagOverrideRule;
}

export function upsertRule(
    rules: readonly FeatureFlagOverrideRule[],
    rule: FeatureFlagOverrideRule,
): FeatureFlagOverrideRule[] {
    const index = rules.findIndex((existing) => isSameRule(existing, rule));
    return index === -1 ? [...rules, rule] : rules.map((existing, i) => (i === index ? rule : existing));
}

export function removeRule(
    rules: readonly FeatureFlagOverrideRule[],
    identity: IOverrideRuleIdentity,
): FeatureFlagOverrideRule[] {
    return rules.filter((existing) => !isSameRule(existing, identity));
}

function isSameRule(rule: FeatureFlagOverrideRule, identity: IOverrideRuleIdentity): boolean {
    return (
        rule.flag === identity.flag &&
        rule.organizationId === identity.organizationId &&
        rule.workspaceId === identity.workspaceId &&
        rule.userId === identity.userId
    );
}

export function getFlagType(flag: OverridableFeatureFlag): FlagType {
    return TigerFeatureDefinitions[flag].type;
}

/**
 * Moves the rule to new conditions with its value; a rule already there is replaced.
 */
export function moveRule(
    rules: readonly FeatureFlagOverrideRule[],
    rule: FeatureFlagOverrideRule,
    conditions: IFeatureFlagOverrideContext,
): FeatureFlagOverrideRule[] {
    const moved = createRule({ flag: rule.flag, value: rule.value, conditions });
    return moved ? upsertRule(removeRule(rules, rule), moved) : [...rules];
}

export interface IRuleMove {
    rules: readonly FeatureFlagOverrideRule[];
    rule: FeatureFlagOverrideRule;
    target: IOverrideTarget;
    context: IFeatureFlagOverrideContext;
}

/**
 * False when, after the move, a more specific rule would apply instead of the moved one.
 */
export function isEffectiveMove({ rules, rule, target, context }: IRuleMove): boolean {
    const conditions = getTargetConditions(target, context);
    const applied = selectFeatureFlagOverrideRules(moveRule(rules, rule, conditions), context).get(rule.flag);
    return applied !== undefined && isSameRule(applied, { flag: rule.flag, ...conditions });
}

/**
 * The flags with a rule that applies in the context, except those set in code, where rules have
 * no effect.
 */
export function getOverriddenFlags(
    rules: readonly FeatureFlagOverrideRule[],
    context: IFeatureFlagOverrideContext,
): ReadonlySet<OverridableFeatureFlag> {
    return new Set(
        [...selectFeatureFlagOverrideRules(rules, context).keys()].filter((flag) => !isSetInCode(flag)),
    );
}

export function isSameRuleAndValue(
    a: FeatureFlagOverrideRule | undefined,
    b: FeatureFlagOverrideRule | undefined,
): boolean {
    if (a === undefined || b === undefined) {
        return a === b;
    }
    return isSameRule(a, b) && isSameValue(a.value, b.value);
}

export function isSameValue(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Counts the rules that would be added, removed or changed by replacing `stored` with `draft`. Copies of
 * a rule count one by one, since hand-edited storage can hold several; reordering them counts when it
 * changes the last copy, which is the one that applies.
 */
export function countChangedRules(
    stored: readonly FeatureFlagOverrideRule[],
    draft: readonly FeatureFlagOverrideRule[],
): number {
    const storedValues = groupValuesByIdentity(stored);
    const draftValues = groupValuesByIdentity(draft);
    const identities = new Set([...storedValues.keys(), ...draftValues.keys()]);
    return [...identities].reduce((count, identity) => {
        const before = storedValues.get(identity) ?? [];
        const after = draftValues.get(identity) ?? [];
        const { removed, added } = matchItems(before, after);
        const winnerChanged = before[before.length - 1] !== after[after.length - 1];
        return count + Math.max(removed, added, winnerChanged ? 1 : 0);
    }, 0);
}

/**
 * Counts the stale rules deleted from `stored` or added to `current`, comparing their content.
 */
export function countChangedStaleRules(
    stored: readonly IStaleFeatureFlagOverrideRule[],
    current: readonly IStaleFeatureFlagOverrideRule[],
): number {
    const toContent = ({ rule }: IStaleFeatureFlagOverrideRule) => JSON.stringify(rule);
    const { removed, added } = matchItems(stored.map(toContent), current.map(toContent));
    return removed + added;
}

function matchItems(before: readonly string[], after: readonly string[]): { removed: number; added: number } {
    const unmatched = [...before];
    let added = 0;
    for (const item of after) {
        const index = unmatched.indexOf(item);
        if (index === -1) {
            added += 1;
        } else {
            unmatched.splice(index, 1);
        }
    }
    return { removed: unmatched.length, added };
}

function groupValuesByIdentity(rules: readonly FeatureFlagOverrideRule[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const { flag, organizationId, workspaceId, userId, value } of rules) {
        const identity = JSON.stringify([flag, organizationId, workspaceId, userId]);
        const values = groups.get(identity) ?? [];
        values.push(JSON.stringify(value));
        groups.set(identity, values);
    }
    return groups;
}

export type JsonSummary = { unit: "items" | "keys"; count: number };

/**
 * An object holding a single array is summarized by that array's length, any other object by its
 * key count.
 */
export function summarizeJson(value: object): JsonSummary {
    const entries = Object.values(value);
    const [onlyEntry] = entries;
    if (!Array.isArray(value) && entries.length === 1 && Array.isArray(onlyEntry)) {
        return { unit: "items", count: onlyEntry.length };
    }
    return Array.isArray(value)
        ? { unit: "items", count: value.length }
        : { unit: "keys", count: entries.length };
}

export type OverrideUser = Pick<IUser, "login" | "email" | "fullName" | "firstName" | "lastName">;

/**
 * Empty strings count as missing: the bare profile sends them for unknown names.
 */
export function getOverrideUserName({ fullName, firstName, lastName, email, login }: OverrideUser): string {
    return fullName || [firstName, lastName].filter(Boolean).join(" ") || email || login;
}

export function splitCamelCase(name: string): string[] {
    return name.split(/(?=[A-Z])/);
}

export function formatDraftText(value: unknown): string {
    if (typeof value === "number") {
        return String(value);
    }
    return typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : "";
}

const DECIMAL_NUMBER = /^-?\d+(\.\d+)?$/;

export function parseDraftText(flag: OverridableFeatureFlag, text: string): unknown {
    const trimmed = text.trim();
    if (trimmed === "") {
        return undefined;
    }
    if (getFlagType(flag) === "NUMBER") {
        return DECIMAL_NUMBER.test(trimmed) ? Number(trimmed) : undefined;
    }
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

export function isValidDraftText(flag: OverridableFeatureFlag, text: string): boolean {
    return isValidFeatureFlagValue(flag, parseDraftText(flag, text));
}

export function formatValue(value: unknown): string {
    if (value === undefined || value === null) {
        return "—";
    }
    return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function isSetInCode(flag: OverridableFeatureFlag): boolean {
    return Object.hasOwn(LocalFeatureFlagOverrides, flag);
}
