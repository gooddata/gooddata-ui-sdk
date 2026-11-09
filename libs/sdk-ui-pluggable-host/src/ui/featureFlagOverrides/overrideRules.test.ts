// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type FeatureFlagOverrideRule } from "@gooddata/sdk-backend-tiger";

import {
    countChangedRules,
    getOverrideUserName,
    isValidDraftText,
    moveRule,
    splitCamelCase,
    summarizeJson,
} from "./overrideRules.js";

describe("moveRule", () => {
    it("moves the rule and replaces the one already at the new conditions", () => {
        const rules: FeatureFlagOverrideRule[] = [
            { flag: "aiChatSearchLimit", value: 1 },
            { flag: "enableRadarChart", value: true },
            { flag: "aiChatSearchLimit", value: 5, organizationId: "org" },
        ];

        expect(moveRule(rules, rules[2], {})).toEqual([
            { flag: "aiChatSearchLimit", value: 5 },
            { flag: "enableRadarChart", value: true },
        ]);
    });
});

describe("countChangedRules", () => {
    it("counts added, removed and changed rules once each", () => {
        const stored: FeatureFlagOverrideRule[] = [
            { flag: "aiChatSearchLimit", value: 1 },
            { flag: "enableRadarChart", value: true },
            { flag: "enableMekkoChart", value: true, organizationId: "org" },
        ];
        const draft: FeatureFlagOverrideRule[] = [
            { flag: "aiChatSearchLimit", value: 2 },
            { flag: "enableMekkoChart", value: true, organizationId: "org" },
            { flag: "enableChangeAnalysis", value: true },
        ];

        expect(countChangedRules(stored, draft)).toBe(3);
        expect(countChangedRules(stored, stored)).toBe(0);
    });

    it("counts a removed copy of a duplicated rule", () => {
        const rule: FeatureFlagOverrideRule = { flag: "enableRadarChart", value: true, userId: "bob" };

        expect(countChangedRules([rule, { ...rule }], [rule])).toBe(1);
        expect(countChangedRules([rule, { ...rule }], [rule, { ...rule, value: false }])).toBe(1);
    });

    it("counts reordered copies only when the last value changes", () => {
        const on: FeatureFlagOverrideRule = { flag: "enableRadarChart", value: true, userId: "bob" };
        const off: FeatureFlagOverrideRule = { ...on, value: false };

        expect(countChangedRules([on, off], [off, on])).toBe(1);
        expect(countChangedRules([on, { ...on }], [{ ...on }, on])).toBe(0);
    });

    it("counts a rule moved to other conditions as a removal and an addition", () => {
        const atOrganization: FeatureFlagOverrideRule = {
            flag: "enableRadarChart",
            value: true,
            organizationId: "org",
        };
        const atWorkspace: FeatureFlagOverrideRule = { ...atOrganization, workspaceId: "ws" };

        expect(countChangedRules([atOrganization], [atWorkspace])).toBe(2);
    });
});

describe("summarizeJson", () => {
    it.each([
        [{ features: [1, 2] }, { unit: "items", count: 2 }],
        [
            { a: 1, b: [1] },
            { unit: "keys", count: 2 },
        ],
        [{ only: "x" }, { unit: "keys", count: 1 }],
        [[1, 2, 3], { unit: "items", count: 3 }],
    ])("summarizes %j", (value, summary) => {
        expect(summarizeJson(value)).toEqual(summary);
    });
});

describe("isValidDraftText", () => {
    it.each([
        ["aiChatSearchLimit", "12", true],
        ["aiChatSearchLimit", "12a", false],
        ["aiChatSearchLimit", "", false],
        ["aiChatSearchLimit", "0x10", false],
        ["aiChatSearchLimit", "1e3", false],
        ["aiChatSearchLimit", " 5 ", true],
        ["aiChatSearchLimit", "-1.5", true],
        ["earlyAccessFeatures", '{"features":[]}', true],
        ["earlyAccessFeatures", '{"features":', false],
        ["earlyAccessFeatures", "[]", false],
    ] as const)("checks %s text %j", (flag, text, isValid) => {
        expect(isValidDraftText(flag, text)).toBe(isValid);
    });
});

describe("splitCamelCase", () => {
    it("splits before each capital letter", () => {
        expect(splitCamelCase("enableRadarChart")).toEqual(["enable", "Radar", "Chart"]);
    });
});

describe("getOverrideUserName", () => {
    it.each([
        ["the full name", { login: "jd", fullName: "Jane Doe", firstName: "J", email: "j@x.io" }, "Jane Doe"],
        [
            "the first and last name",
            { login: "jd", fullName: "", firstName: "Jane", lastName: "Doe" },
            "Jane Doe",
        ],
        ["the first name alone", { login: "jd", firstName: "Jane", lastName: "" }, "Jane"],
        ["the e-mail", { login: "jd", fullName: "", firstName: "", lastName: "", email: "j@x.io" }, "j@x.io"],
        ["the login", { login: "jd", fullName: "", email: "" }, "jd"],
    ])("uses %s", (_name, user, expected) => {
        expect(getOverrideUserName(user)).toBe(expected);
    });
});
