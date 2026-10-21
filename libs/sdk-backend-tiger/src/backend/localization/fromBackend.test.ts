// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    convertLocalizationStatistics,
    convertLocalizationUsage,
    convertLocalizationUsageUsers,
    convertLocalizationUsageWorkspaces,
    convertWorkspaceLocalizationUsage,
    convertWorkspaceLocalizationUsageWorkspaces,
    originIdsOf,
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

describe("convertLocalizationStatistics", () => {
    it("keeps the metadata and data languages apart", () => {
        expect(
            convertLocalizationStatistics({
                metadata: { locales: [{ locale: "de-DE" }, { locale: "ja-JP" }] },
                data: { locales: [] },
            }),
        ).toEqual({
            metadata: { locales: [{ locale: "de-DE" }, { locale: "ja-JP" }] },
            data: { locales: [] },
        });
    });
});

describe("convertWorkspaceLocalizationUsage", () => {
    it("takes the defaults from the values the workspace gets", () => {
        const count = { total: 1, bySource: { WORKSPACE: 1 } };
        const usage = convertWorkspaceLocalizationUsage({
            settings: {
                LOCALE: { content: { value: "de-DE" }, source: "PARENT", originId: "retail" },
                METADATA_LOCALE: { content: { value: "en-US" }, source: "ORGANIZATION" },
                DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
            },
            values: [{ content: { value: "de-DE" }, workspaces: count, users: count, bySetting: {} }],
        });

        expect(usage).toEqual({
            defaults: {
                LOCALE: { content: { value: "de-DE" }, source: "PARENT" },
                METADATA_LOCALE: { content: { value: "en-US" }, source: "ORGANIZATION" },
                DATA_LOCALE: null,
            },
            values: [{ content: { value: "de-DE" }, workspaces: count, users: count, bySetting: {} }],
        });
    });
});

describe("convertWorkspaceLocalizationUsageWorkspaces", () => {
    const usage = {
        settings: {
            LOCALE: { content: { value: "fr-FR" }, source: "WORKSPACE" as const },
            METADATA_LOCALE: { content: { value: "de-DE" }, source: "PARENT" as const, originId: "retail" },
            DATA_LOCALE: { content: { value: null }, source: "DEFAULT" as const },
        },
        values: [],
    };
    const workspace = {
        id: "bergmann",
        name: "Bergmann GmbH",
        parentId: "retail",
        parentName: "Retail",
        childrenCount: 0,
    };

    it("lists the workspace for the value it gets", () => {
        expect(
            convertWorkspaceLocalizationUsageWorkspaces(
                usage,
                workspace,
                { value: "fr-FR", setting: "LOCALE" },
                new Map([["retail", "Retail"]]),
            ),
        ).toEqual({
            totalCount: 1,
            workspaces: [
                {
                    ...workspace,
                    source: "WORKSPACE",
                    bySetting: {
                        LOCALE: { content: { value: "fr-FR" }, source: "WORKSPACE" },
                        METADATA_LOCALE: {
                            content: { value: "de-DE" },
                            source: "PARENT",
                            originId: "retail",
                            originName: "Retail",
                        },
                        DATA_LOCALE: { content: { value: null }, source: "DEFAULT" },
                    },
                },
            ],
        });
    });

    it("lists nothing for a value the workspace does not get", () => {
        expect(
            convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, {
                value: "en-US",
                setting: "LOCALE",
            }),
        ).toEqual({ totalCount: 0, workspaces: [] });
    });

    it("names an origin above the parent", () => {
        const inherited = {
            ...usage,
            settings: {
                ...usage.settings,
                LOCALE: { content: { value: "fr-FR" }, source: "PARENT" as const, originId: "emea" },
            },
        };
        const result = convertWorkspaceLocalizationUsageWorkspaces(
            inherited,
            workspace,
            { value: "fr-FR", setting: "LOCALE" },
            new Map([["emea", "EMEA"]]),
        );
        expect(result.workspaces[0]?.bySetting.LOCALE?.originName).toBe("EMEA");
        expect(originIdsOf(inherited)).toEqual(["emea", "retail"]);
    });

    it("lists the workspace only when its name matches", () => {
        const query = { value: "fr-FR", setting: "LOCALE" as const };
        expect(
            convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, { ...query, name: "BERG" })
                .totalCount,
        ).toBe(1);
        expect(
            convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, { ...query, name: "retail" })
                .totalCount,
        ).toBe(0);
    });

    it("pages the workspace like the other lists", () => {
        const query = { value: "fr-FR", setting: "LOCALE" as const };
        expect(convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, { ...query, size: 0 })).toEqual({
            totalCount: 1,
            workspaces: [],
        });
        expect(convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, { ...query, page: 1 })).toEqual({
            totalCount: 1,
            workspaces: [],
        });
    });

    it("lists nothing for another source", () => {
        expect(
            convertWorkspaceLocalizationUsageWorkspaces(usage, workspace, {
                value: "de-DE",
                setting: "METADATA_LOCALE",
                source: "WORKSPACE",
            }),
        ).toEqual({ totalCount: 0, workspaces: [] });
    });
});
