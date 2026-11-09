// (C) 2026 GoodData Corporation

import { type ITigerFeatureFlags, TigerFeatureDefinitions } from "./uiFeatures.js";

/**
 * @internal
 */
export const FEATURE_FLAG_OVERRIDES_STORAGE_KEY = "gdFeatureFlagOverrides";

/**
 * @internal
 */
export const FEATURE_FLAG_OVERRIDES_GATE_FLAG = "enableFeatureFlagOverrides";

// A format change must bump this and convert the previous version in parseFeatureFlagOverrides;
// otherwise stored and exported overrides become unreadable and the next Apply overwrites them.
const STORAGE_VERSION = 1;

/**
 * @internal
 */
export type OverridableFeatureFlag = Exclude<
    keyof ITigerFeatureFlags,
    typeof FEATURE_FLAG_OVERRIDES_GATE_FLAG
>;

/**
 * @internal
 */
export type FeatureFlagOverrideRule<K extends OverridableFeatureFlag = OverridableFeatureFlag> =
    K extends OverridableFeatureFlag
        ? {
              flag: K;
              value: Exclude<ITigerFeatureFlags[K], undefined>;
              organizationId?: string;
              workspaceId?: string;
              userId?: string;
          }
        : never;

/**
 * @internal
 */
export type StaleFeatureFlagOverrideReason = "invalidRule" | "unknownFlag" | "gateFlag" | "invalidValue";

/**
 * @internal
 */
export interface IStaleFeatureFlagOverrideRule {
    rule: unknown;
    reason: StaleFeatureFlagOverrideReason;
}

/**
 * @internal
 */
export interface IFeatureFlagOverrides {
    rules: FeatureFlagOverrideRule[];
    staleRules: IStaleFeatureFlagOverrideRule[];
}

/**
 * @internal
 */
export interface IStoredFeatureFlagOverrides extends IFeatureFlagOverrides {
    /**
     * The stored text when it is not valid JSON, has an unsupported version or has no rules array.
     * Writing new overrides replaces it.
     */
    unreadableContent?: string;
}

/**
 * @internal
 */
export interface IFeatureFlagOverrideContext {
    organizationId?: string;
    workspaceId?: string;
    userId?: string;
}

/**
 * @internal
 */
export function parseFeatureFlagOverrides(content: string): IStoredFeatureFlagOverrides {
    let document: unknown;
    try {
        document = JSON.parse(content);
    } catch {
        return { rules: [], staleRules: [], unreadableContent: content };
    }
    if (!isRecord(document) || document["version"] !== STORAGE_VERSION || !Array.isArray(document["rules"])) {
        return { rules: [], staleRules: [], unreadableContent: content };
    }

    const result: IFeatureFlagOverrides = { rules: [], staleRules: [] };
    for (const rule of document["rules"]) {
        const parsed = parseRule(rule);
        if (typeof parsed === "string") {
            result.staleRules.push({ rule, reason: parsed });
        } else {
            result.rules.push(parsed);
        }
    }
    return result;
}

/**
 * @internal
 */
export function serializeFeatureFlagOverrides({ rules, staleRules }: IFeatureFlagOverrides): string {
    return JSON.stringify({
        version: STORAGE_VERSION,
        rules: [...rules, ...staleRules.map(({ rule }) => rule)],
    });
}

/**
 * @internal
 */
export function readFeatureFlagOverrides(): IStoredFeatureFlagOverrides {
    try {
        const content = getLocalStorage()?.getItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY);
        return content ? parseFeatureFlagOverrides(content) : { rules: [], staleRules: [] };
    } catch {
        return { rules: [], staleRules: [] };
    }
}

/**
 * @internal
 */
export function writeFeatureFlagOverrides(overrides: IFeatureFlagOverrides): boolean {
    try {
        const storage = getLocalStorage();
        if (!storage) {
            return false;
        }
        if (overrides.rules.length === 0 && overrides.staleRules.length === 0) {
            storage.removeItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY);
        } else {
            storage.setItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY, serializeFeatureFlagOverrides(overrides));
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Picks the rule that applies to each flag in the context. A condition a rule leaves out matches
 * anything. A workspace rule beats an organization rule, which beats a rule for everywhere; among
 * rules of the same level, the later one wins. The user ID only filters rules, it adds no level.
 *
 * @internal
 */
export function selectFeatureFlagOverrideRules(
    rules: readonly FeatureFlagOverrideRule[],
    context: IFeatureFlagOverrideContext,
): Map<OverridableFeatureFlag, FeatureFlagOverrideRule> {
    const selected = new Map<OverridableFeatureFlag, FeatureFlagOverrideRule>();
    for (const rule of rules) {
        if (!matchesContext(rule, context)) {
            continue;
        }
        const current = selected.get(rule.flag);
        if (!current || getSpecificity(rule) >= getSpecificity(current)) {
            selected.set(rule.flag, rule);
        }
    }
    return selected;
}

/**
 * @internal
 */
export function resolveFeatureFlagOverrides(
    rules: readonly FeatureFlagOverrideRule[],
    context: IFeatureFlagOverrideContext,
): Partial<ITigerFeatureFlags> {
    const result: Partial<ITigerFeatureFlags> = {};
    for (const rule of selectFeatureFlagOverrideRules(rules, context).values()) {
        Object.assign(result, { [rule.flag]: rule.value });
    }
    return result;
}

const serverFeatureFlags = new Map<string, Partial<ITigerFeatureFlags>>();

/**
 * The flags last loaded from the server for the workspace, or for the organization when no workspace
 * is given, before the runtime overrides were applied. Flags set in code are left out because their
 * server value is not loaded.
 *
 * @internal
 */
export function getServerFeatureFlags(workspaceId?: string): Partial<ITigerFeatureFlags> | undefined {
    return serverFeatureFlags.get(workspaceId ?? "");
}

export function rememberServerFeatureFlags(flags: Partial<ITigerFeatureFlags>, workspaceId?: string): void {
    serverFeatureFlags.set(workspaceId ?? "", flags);
}

function parseRule(rule: unknown): FeatureFlagOverrideRule | StaleFeatureFlagOverrideReason {
    if (!isRecord(rule) || typeof rule["flag"] !== "string" || !Object.hasOwn(rule, "value")) {
        return "invalidRule";
    }
    const { flag, value, organizationId, workspaceId, userId } = rule;
    if (!isOptionalString(organizationId) || !isOptionalString(workspaceId) || !isOptionalString(userId)) {
        return "invalidRule";
    }
    if (flag === FEATURE_FLAG_OVERRIDES_GATE_FLAG) {
        return "gateFlag";
    }
    if (!isOverridableFeatureFlag(flag)) {
        return "unknownFlag";
    }
    if (!isValidFeatureFlagValue(flag, value)) {
        return "invalidValue";
    }
    // The value is checked against the flag's type above; TS cannot tie a flag name to its value type.
    return {
        flag,
        value,
        ...(organizationId === undefined ? {} : { organizationId }),
        ...(workspaceId === undefined ? {} : { workspaceId }),
        ...(userId === undefined ? {} : { userId }),
    } as FeatureFlagOverrideRule;
}

/**
 * @internal
 */
export function isOverridableFeatureFlag(flag: string): flag is OverridableFeatureFlag {
    return Object.hasOwn(TigerFeatureDefinitions, flag) && flag !== FEATURE_FLAG_OVERRIDES_GATE_FLAG;
}

/**
 * A JSON flag accepts any non-array object; its inner shape is not checked.
 *
 * @internal
 */
export function isValidFeatureFlagValue<K extends OverridableFeatureFlag>(
    flag: K,
    value: unknown,
): value is FeatureFlagOverrideRule<K>["value"] {
    switch (TigerFeatureDefinitions[flag].type) {
        case "BOOLEAN":
            return typeof value === "boolean";
        case "NUMBER":
            return typeof value === "number" && Number.isFinite(value);
        case "JSON":
            return isRecord(value);
    }
}

/**
 * Whether the rule's conditions allow it in the context. It may still lose to a more specific rule.
 *
 * @internal
 */
export function isFeatureFlagOverrideRuleInContext(
    rule: FeatureFlagOverrideRule,
    context: IFeatureFlagOverrideContext,
): boolean {
    return matchesContext(rule, context);
}

function matchesContext(rule: FeatureFlagOverrideRule, context: IFeatureFlagOverrideContext): boolean {
    return (
        matchesCondition(rule.organizationId, context.organizationId) &&
        matchesCondition(rule.workspaceId, context.workspaceId) &&
        matchesCondition(rule.userId, context.userId)
    );
}

function matchesCondition(condition: string | undefined, value: string | undefined): boolean {
    return condition === undefined || condition === value;
}

function getSpecificity(rule: FeatureFlagOverrideRule): number {
    if (rule.workspaceId !== undefined) {
        return 2;
    }
    return rule.organizationId === undefined ? 0 : 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
    return value === undefined || typeof value === "string";
}

function getLocalStorage(): Storage | undefined {
    return typeof window === "undefined" ? undefined : window.localStorage;
}
