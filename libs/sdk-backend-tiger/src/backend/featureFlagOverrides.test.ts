// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
    type FeatureFlagOverrideRule,
    type IFeatureFlagOverrides,
    isFeatureFlagOverrideRuleInContext,
    parseFeatureFlagOverrides,
    readFeatureFlagOverrides,
    resolveFeatureFlagOverrides,
    serializeFeatureFlagOverrides,
    writeFeatureFlagOverrides,
} from "./featureFlagOverrides.js";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
    readonly items = new Map<string, string>();
    getItem(key: string) {
        return this.items.get(key) ?? null;
    }
    setItem(key: string, value: string) {
        this.items.set(key, value);
    }
    removeItem(key: string) {
        this.items.delete(key);
    }
}

const document = (rules: unknown[], version: unknown = 1) => JSON.stringify({ version, rules });

describe("parseFeatureFlagOverrides", () => {
    it("keeps valid rules with their conditions", () => {
        const rule = {
            flag: "enableRadarChart",
            value: true,
            organizationId: "org",
            workspaceId: "ws",
            userId: "user",
        };

        expect(parseFeatureFlagOverrides(document([rule]))).toEqual({ rules: [rule], staleRules: [] });
    });

    it("checks each value against the flag's type", () => {
        const valid = [
            { flag: "enableRadarChart", value: false },
            { flag: "aiChatSearchLimit", value: 0 },
            { flag: "earlyAccessFeatures", value: { items: [] } },
        ];
        const invalid = [
            { flag: "enableRadarChart", value: "true" },
            { flag: "aiChatSearchLimit", value: "42" },
            { flag: "aiChatSearchLimit", value: null },
            { flag: "earlyAccessFeatures", value: null },
            { flag: "earlyAccessFeatures", value: "{}" },
            { flag: "earlyAccessFeatures", value: [] },
        ];

        const result = parseFeatureFlagOverrides(document([...valid, ...invalid]));

        expect(result.rules).toEqual(valid);
        expect(result.staleRules).toEqual(invalid.map((rule) => ({ rule, reason: "invalidValue" })));
    });

    it("marks unknown flags, the gate flag and malformed rules as stale", () => {
        const unknownFlag = { flag: "enableSomethingRemoved", value: true };
        const gateFlag = { flag: "enableFeatureFlagOverrides", value: true };
        const malformed = [
            "enableRadarChart",
            null,
            { flag: "enableRadarChart" },
            { flag: "enableRadarChart", value: true, workspaceId: 42 },
        ];

        expect(parseFeatureFlagOverrides(document([unknownFlag, gateFlag, ...malformed]))).toEqual({
            rules: [],
            staleRules: [
                { rule: unknownFlag, reason: "unknownFlag" },
                { rule: gateFlag, reason: "gateFlag" },
                ...malformed.map((rule) => ({ rule, reason: "invalidRule" })),
            ],
        });
    });

    it.each([
        ["broken JSON", "{"],
        ["an unsupported version", document([], 2)],
        ["a missing rules array", JSON.stringify({ version: 1 })],
        ["a non-object document", "[]"],
    ])("reports %s as unreadable", (_name, content) => {
        expect(parseFeatureFlagOverrides(content)).toEqual({
            rules: [],
            staleRules: [],
            unreadableContent: content,
        });
    });

    it("drops properties that are not part of a rule", () => {
        const result = parseFeatureFlagOverrides(
            document([{ flag: "enableRadarChart", value: true, note: "x" }]),
        );

        expect(result.rules).toEqual([{ flag: "enableRadarChart", value: true }]);
    });
});

describe("serializeFeatureFlagOverrides", () => {
    it("writes the stale rules back unchanged after the valid ones", () => {
        const stale = { flag: "enableSomethingRemoved", value: true };
        const content = serializeFeatureFlagOverrides({
            rules: [{ flag: "enableRadarChart", value: true }],
            staleRules: [{ rule: stale, reason: "unknownFlag" }],
        });

        expect(JSON.parse(content)).toEqual({
            version: 1,
            rules: [{ flag: "enableRadarChart", value: true }, stale],
        });
    });
});

describe("resolveFeatureFlagOverrides", () => {
    const context = { organizationId: "org", workspaceId: "ws", userId: "user" };

    it("lets a workspace rule beat an organization rule, which beats a rule for everywhere", () => {
        const rules: FeatureFlagOverrideRule[] = [
            { flag: "aiChatSearchLimit", value: 3, organizationId: "org", workspaceId: "ws" },
            { flag: "aiChatSearchLimit", value: 2, organizationId: "org" },
            { flag: "aiChatSearchLimit", value: 1 },
            { flag: "enableRadarChart", value: true, organizationId: "org" },
            { flag: "enableRadarChart", value: false },
        ];

        expect(resolveFeatureFlagOverrides(rules, context)).toEqual({
            aiChatSearchLimit: 3,
            enableRadarChart: true,
        });
    });

    it("lets the later rule win within the same level", () => {
        const rules: FeatureFlagOverrideRule[] = [
            { flag: "aiChatSearchLimit", value: 1, organizationId: "org" },
            { flag: "aiChatSearchLimit", value: 2, organizationId: "org", userId: "user" },
        ];

        expect(resolveFeatureFlagOverrides(rules, context)).toEqual({ aiChatSearchLimit: 2 });
    });

    it("ignores rules for another organization, workspace or user", () => {
        const rules: FeatureFlagOverrideRule[] = [
            { flag: "enableRadarChart", value: true, organizationId: "other" },
            { flag: "enableMekkoChart", value: true, organizationId: "org", workspaceId: "other" },
            { flag: "enableChangeAnalysis", value: true, userId: "other" },
            { flag: "aiChatSearchLimit", value: 5, userId: "user" },
        ];

        expect(resolveFeatureFlagOverrides(rules, context)).toEqual({ aiChatSearchLimit: 5 });
    });

    it("does not apply workspace rules outside a workspace", () => {
        const rules: FeatureFlagOverrideRule[] = [
            { flag: "enableRadarChart", value: true, organizationId: "org", workspaceId: "ws" },
        ];

        expect(resolveFeatureFlagOverrides(rules, { organizationId: "org", userId: "user" })).toEqual({});
    });
});

describe("isFeatureFlagOverrideRuleInContext", () => {
    const context = { organizationId: "org", workspaceId: "ws", userId: "user" };

    it("treats a missing condition as matching anything", () => {
        expect(isFeatureFlagOverrideRuleInContext({ flag: "enableRadarChart", value: true }, context)).toBe(
            true,
        );
        expect(
            isFeatureFlagOverrideRuleInContext(
                { flag: "enableRadarChart", value: true, organizationId: "org" },
                context,
            ),
        ).toBe(true);
    });

    it("does not match another workspace", () => {
        expect(
            isFeatureFlagOverrideRuleInContext(
                { flag: "enableRadarChart", value: true, organizationId: "org", workspaceId: "other" },
                context,
            ),
        ).toBe(false);
    });

    it("does not match another user", () => {
        expect(
            isFeatureFlagOverrideRuleInContext(
                { flag: "enableRadarChart", value: true, userId: "bob" },
                context,
            ),
        ).toBe(false);
    });
});

describe("storage", () => {
    let storage: MemoryStorage;

    beforeEach(() => {
        storage = new MemoryStorage();
        vi.stubGlobal("window", { localStorage: storage });
    });

    it("reads nothing when the storage is empty", () => {
        expect(readFeatureFlagOverrides()).toEqual({ rules: [], staleRules: [] });
    });

    it("reads what it wrote", () => {
        const overrides: IFeatureFlagOverrides = {
            rules: [{ flag: "enableRadarChart", value: true }],
            staleRules: [],
        };

        expect(writeFeatureFlagOverrides(overrides)).toBe(true);
        expect(readFeatureFlagOverrides()).toEqual(overrides);
    });

    it("removes the key when there is nothing to store", () => {
        storage.setItem(FEATURE_FLAG_OVERRIDES_STORAGE_KEY, document([]));

        expect(writeFeatureFlagOverrides({ rules: [], staleRules: [] })).toBe(true);
        expect(storage.items.has(FEATURE_FLAG_OVERRIDES_STORAGE_KEY)).toBe(false);
    });

    it("reads nothing and fails to write when the storage throws", () => {
        vi.stubGlobal("window", {
            get localStorage(): Storage {
                throw new Error("SecurityError");
            },
        });

        expect(readFeatureFlagOverrides()).toEqual({ rules: [], staleRules: [] });
        expect(writeFeatureFlagOverrides({ rules: [], staleRules: [] })).toBe(false);
    });

    it("reads nothing and fails to write without a window", () => {
        vi.unstubAllGlobals();

        expect(readFeatureFlagOverrides()).toEqual({ rules: [], staleRules: [] });
        expect(writeFeatureFlagOverrides({ rules: [], staleRules: [] })).toBe(false);
    });
});
