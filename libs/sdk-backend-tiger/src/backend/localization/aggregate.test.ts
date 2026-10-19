// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    effectiveSettings,
    ownSettings,
    summarize,
    translatedLocalesOf,
    translationUsage,
    usageUsers,
    usageWorkspaces,
} from "./aggregate.js";
import { acmePeople, acmeStatisticsWorkspaces, acmeWorkspaces } from "./fixture.js";

const workspaces = acmeWorkspaces();
const people = acmePeople(workspaces.map((workspace) => workspace.id));
const organizationScope = {
    workspaces,
    people: people.map((person) => ({ ...person, settings: ownSettings(person) })),
};

const valueOf = (code: string | null) =>
    summarize(organizationScope, "own").values.find((entry) => entry.content.value === code);

describe("summarize at organization level", () => {
    it("counts each workspace once per language under its strongest source", () => {
        expect(valueOf("de-DE")?.workspaces).toEqual({ total: 42, bySource: { WORKSPACE: 38, PARENT: 4 } });
    });

    it("splits the counts per setting", () => {
        expect(valueOf("de-DE")?.bySetting.METADATA_LOCALE?.workspaces.total).toBe(36);
        expect(valueOf("de-DE")?.bySetting.DATA_LOCALE?.workspaces.total).toBe(2);
    });

    it("counts people only under a value they set themselves", () => {
        expect(valueOf("ko-KR")?.users).toEqual({ total: 3, bySource: { USER: 3 } });
        expect(valueOf("de-DE")?.users.total).toBe(1);
    });

    it("puts people without an own setting in the null entry", () => {
        expect(valueOf(null)?.users.total).toBe(1240 - 11);
    });
});

describe("summarize at workspace level", () => {
    it("counts the people with access under the value they get there", () => {
        const workspace = workspaces.find((candidate) => candidate.id === "dach")!;
        const scope = {
            workspaces: [workspace],
            people: people
                .filter((person) => person.workspaceIds.includes(workspace.id))
                .map((person) => ({ ...person, settings: effectiveSettings(person, workspace) })),
        };
        const deDE = summarize(scope, "effective").values.find((entry) => entry.content.value === "de-DE");

        expect(deDE?.workspaces.total).toBe(1);
        expect(deDE?.users.total).toBe(scope.people.length);
    });
});

describe("usage lists", () => {
    it("lists the workspaces that inherit a display language", () => {
        const { totalCount } = usageWorkspaces(organizationScope, {
            value: "de-DE",
            setting: "LOCALE",
            source: "PARENT",
        });

        expect(totalCount).toBe(41);
    });

    it("lists everyone with an own display language when no value is given", () => {
        const { users, totalCount } = usageUsers(organizationScope, { setting: "LOCALE", size: 3 });

        expect(totalCount).toBe(10);
        expect(users).toHaveLength(3);
        expect(users.every((user) => user.source === "USER")).toBe(true);
    });
});

describe("usageWorkspaces names", () => {
    it("names the parent and the origin of an inherited value", () => {
        const { workspaces: rows } = usageWorkspaces(organizationScope, {
            value: "de-DE",
            setting: "LOCALE",
            source: "PARENT",
        });
        const row = rows[0];
        const parent = workspaces.find((workspace) => workspace.id === row.parentId);
        const origin = workspaces.find((workspace) => workspace.id === row.bySetting.LOCALE?.originId);

        expect(row.parentName).toBeDefined();
        expect(row.parentName).toBe(parent?.name);
        expect(row.bySetting.LOCALE?.originName).toBeDefined();
        expect(row.bySetting.LOCALE?.originName).toBe(origin?.name);
    });

    it("names a parent outside the scope from the scope's name list", () => {
        const child = workspaces.find((workspace) => workspace.parentId !== null)!;
        const { workspaces: rows } = usageWorkspaces(
            {
                workspaces: [child],
                people: [],
                workspaceNames: new Map(workspaces.map((workspace) => [workspace.id, workspace.name])),
            },
            {},
        );

        expect(rows[0].parentName).toBe(
            workspaces.find((workspace) => workspace.id === child.parentId)?.name,
        );
    });
});

describe("translationUsage", () => {
    const scope = {
        ...organizationScope,
        translatedLocales: translatedLocalesOf(workspaces, acmeStatisticsWorkspaces()),
    };
    const translationsOf = (code: string) =>
        translationUsage(scope).values.find((entry) => entry.content.value === code)?.bySetting;

    it("counts the workspaces that set a language without a translation", () => {
        expect(translationsOf("es-ES")?.METADATA_LOCALE?.missing.workspaces).toBe(10);
    });

    it("counts the workspaces that could use a translation to their interface language", () => {
        expect(translationsOf("it-IT")?.METADATA_LOCALE?.available).toEqual({ workspaces: 9, users: 0 });
        expect(translationsOf("it-IT")?.DATA_LOCALE).toBeUndefined();
    });

    it("finds nothing missing where every workspace has the translation", () => {
        expect(translationsOf("de-DE")?.METADATA_LOCALE?.missing.workspaces ?? 0).toBe(0);
    });

    it("lists the workspaces behind a count", () => {
        const page = usageWorkspaces(scope, {
            value: "es-ES",
            setting: "METADATA_LOCALE",
            translation: "missing",
        });

        expect(page.totalCount).toBe(10);
        expect(page.workspaces.map((workspace) => workspace.id)).toContain("iberia-16");
        expect(page.workspaces.map((workspace) => workspace.id)).not.toContain("iberia-01");
    });
});

describe("translatedLocalesOf", () => {
    const row = (total: number) => ({
        id: "italy",
        name: "Italy",
        parentId: null,
        sourceLanguage: "it-IT",
        metadata: { total, locales: [] },
        data: { total: 0, locales: [] },
    });

    it("counts the source language of content as translated", () => {
        expect(translatedLocalesOf(workspaces, [row(5)])("italy-01", "METADATA_LOCALE").has("it-IT")).toBe(
            true,
        );
    });

    it("ignores the source language where there is no content of that kind", () => {
        expect(translatedLocalesOf(workspaces, [row(0)])("italy-01", "METADATA_LOCALE").has("it-IT")).toBe(
            false,
        );
        expect(translatedLocalesOf(workspaces, [row(5)])("italy-01", "DATA_LOCALE").has("it-IT")).toBe(false);
    });
});
