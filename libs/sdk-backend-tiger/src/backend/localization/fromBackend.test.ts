// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    convertLocalizationUsage,
    convertLocalizationUsageUsers,
    convertLocalizationUsageWorkspaces,
} from "./fromBackend.js";

describe("convertLocalizationUsage", () => {
    it("converts missing and null defaults to null", () => {
        const usage = convertLocalizationUsage({
            defaults: {
                LOCALE: { content: { value: "fr-FR" }, source: "ORGANIZATION" },
                DATA_LOCALE: null,
            },
            values: [],
        });

        expect(usage.defaults).toEqual({
            LOCALE: { content: { value: "fr-FR" }, source: "ORGANIZATION" },
            METADATA_LOCALE: null,
            DATA_LOCALE: null,
        });
    });

    it("keeps the value without a language and the per-setting counts", () => {
        const count = { total: 2, bySource: { WORKSPACE: 1, PARENT: 1 } };
        const usage = convertLocalizationUsage({
            defaults: {},
            values: [
                {
                    content: {},
                    workspaces: count,
                    users: { total: 0, bySource: {} },
                    bySetting: { DATA_LOCALE: { workspaces: count, users: { total: 0, bySource: {} } } },
                },
            ],
        });

        expect(usage.values).toEqual([
            {
                content: { value: null },
                workspaces: count,
                users: { total: 0, bySource: {} },
                bySetting: { DATA_LOCALE: { workspaces: count, users: { total: 0, bySource: {} } } },
            },
        ]);
    });
});

describe("convertLocalizationUsageWorkspaces", () => {
    it("sets originId only for inherited values and defaults parentId to null", () => {
        const page = convertLocalizationUsageWorkspaces({
            totalCount: 1,
            workspaces: [
                {
                    id: "bergmann",
                    name: "Bergmann GmbH",
                    childrenCount: 0,
                    source: "PARENT",
                    bySetting: {
                        LOCALE: { content: { value: "de-DE" }, source: "PARENT", originId: "retail" },
                        METADATA_LOCALE: { content: { value: "en-US" }, source: "DEFAULT", originId: null },
                        DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
                    },
                },
            ],
        });

        expect(page).toEqual({
            totalCount: 1,
            workspaces: [
                {
                    id: "bergmann",
                    name: "Bergmann GmbH",
                    parentId: null,
                    childrenCount: 0,
                    source: "PARENT",
                    bySetting: {
                        LOCALE: { content: { value: "de-DE" }, source: "PARENT", originId: "retail" },
                        METADATA_LOCALE: { content: { value: "en-US" }, source: "DEFAULT" },
                        DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
                    },
                },
            ],
        });
    });
});

describe("convertLocalizationUsageUsers", () => {
    it("leaves out a missing name or email and settings the user does not set", () => {
        const page = convertLocalizationUsageUsers({
            totalCount: 1,
            users: [
                {
                    id: "jdoe",
                    name: null,
                    email: "jdoe@example.com",
                    source: "USER",
                    bySetting: {
                        LOCALE: { content: { value: "ko-KR" }, source: "USER" },
                        METADATA_LOCALE: null,
                    },
                },
            ],
        });

        expect(page).toEqual({
            totalCount: 1,
            users: [
                {
                    id: "jdoe",
                    email: "jdoe@example.com",
                    source: "USER",
                    bySetting: { LOCALE: { content: { value: "ko-KR" }, source: "USER" } },
                },
            ],
        });
    });
});
