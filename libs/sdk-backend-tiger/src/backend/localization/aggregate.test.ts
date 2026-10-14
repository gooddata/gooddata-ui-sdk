// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { effectiveSettings, ownSettings, summarize, usageUsers, usageWorkspaces } from "./aggregate.js";
import { acmePeople, acmeWorkspaces } from "./fixture.js";

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
