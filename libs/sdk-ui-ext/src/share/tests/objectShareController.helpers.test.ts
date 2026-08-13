// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IObjectAccessList, idRef } from "@gooddata/sdk-model";

import {
    type GranteeEdit,
    assigneeIdentityFacts,
    buildLabelMutations,
    buildLabelRegrades,
    effectivePermissionAbove,
    granteeDisplayPair,
    granteesFromAccessList,
    levelsAbove,
    levelsBelow,
    mergeGrantees,
    sortGrantees,
    sortShareableLabels,
    userIdentityFacts,
} from "../objectShareController.helpers.js";
import type { IObjectShareGrantee, ISelfIdentity } from "../objectShareController.types.js";
import type { IObjectShareLabel } from "../types.js";

const REF = idRef("u1");

function userRow(facts: { name?: string; email?: string }): IObjectShareGrantee {
    return { id: "user:u1", kind: "user", granteeRef: REF, level: "VIEW", ...facts };
}

describe("userIdentityFacts", () => {
    // Pins the inverse of the converters' `name ?? email ?? id` / `email ?? id` collapse.
    it("keeps a real name and email", () => {
        expect(userIdentityFacts(REF, "Jane Good", "jane@example.com")).toEqual({
            name: "Jane Good",
            email: "jane@example.com",
        });
    });

    it("treats a name equal to the email as the email fallback, not a name", () => {
        expect(userIdentityFacts(REF, "jane@example.com", "jane@example.com")).toEqual({
            name: undefined,
            email: "jane@example.com",
        });
    });

    it("treats fields equal to the raw id as absent", () => {
        expect(userIdentityFacts(REF, "u1", "u1")).toEqual({ name: undefined, email: undefined });
    });

    it("keeps a real name when only the email collapsed to the id", () => {
        expect(userIdentityFacts(REF, "Jane Good", "u1")).toEqual({
            name: "Jane Good",
            email: undefined,
        });
    });
});

describe("assigneeIdentityFacts", () => {
    it("recovers a user assignee's facts through the same de-collapse as grants", () => {
        expect(
            assigneeIdentityFacts({
                type: "user",
                ref: REF,
                name: "u1",
                email: "jane@example.com",
                status: "ENABLED",
            }),
        ).toEqual({ name: undefined, email: "jane@example.com" });
    });

    it("recovers a group assignee's name, treating an id-equal name as absent", () => {
        expect(assigneeIdentityFacts({ type: "group", ref: idRef("g1"), name: "Marketing" })).toEqual({
            name: "Marketing",
        });
        expect(assigneeIdentityFacts({ type: "group", ref: idRef("g1"), name: "g1" })).toEqual({
            name: undefined,
        });
    });
});

describe("granteeDisplayPair", () => {
    // The spec's fallback order (F1-2607): name + email → name + userID →
    // email + userID → userID alone.
    it("shows name + email when both are known", () => {
        expect(granteeDisplayPair(userRow({ name: "Jane Good", email: "jane@example.com" }))).toEqual({
            name: "Jane Good",
            email: "jane@example.com",
        });
    });

    it("falls back to name + userID when the email is unknown", () => {
        expect(granteeDisplayPair(userRow({ name: "Jane Good" }))).toEqual({
            name: "Jane Good",
            email: "u1",
        });
    });

    it("falls back to email + userID when the name is unknown", () => {
        expect(granteeDisplayPair(userRow({ email: "jane@example.com" }))).toEqual({
            name: "jane@example.com",
            email: "u1",
        });
    });

    it("shows the userID alone (no duplicate subline) when nothing else is known", () => {
        expect(granteeDisplayPair(userRow({}))).toEqual({ name: "u1" });
    });

    it("shows a group's name without a subline, or its raw id when unknown", () => {
        const group: IObjectShareGrantee = {
            id: "group:g1",
            kind: "group",
            granteeRef: idRef("g1"),
            level: "VIEW",
            name: "Marketing",
        };
        expect(granteeDisplayPair(group)).toEqual({ name: "Marketing" });
        expect(granteeDisplayPair({ ...group, name: undefined })).toEqual({ name: "g1" });
    });
});

describe("granteesFromAccessList identity facts", () => {
    it("de-collapses tiger's id fallbacks into absent facts", () => {
        // The shape tiger produces when the permissions endpoint returns only ids.
        const list: IObjectAccessList = {
            grants: [
                {
                    type: "granularUser",
                    user: { ref: REF, uri: "u1", login: "u1", email: "u1", fullName: "u1" },
                    permissions: ["VIEW"],
                    inheritedPermissions: [],
                },
                {
                    type: "granularGroup",
                    userGroup: { ref: idRef("g1"), name: "g1" },
                    permissions: ["VIEW"],
                    inheritedPermissions: [],
                },
            ],
        };
        const [user, group] = granteesFromAccessList(list);
        expect(user).toMatchObject({ id: "user:u1", name: undefined, email: undefined });
        expect(group).toMatchObject({ id: "group:g1", name: undefined });
    });

    it("keeps real identities from the grants", () => {
        const list: IObjectAccessList = {
            grants: [
                {
                    type: "granularUser",
                    user: {
                        ref: REF,
                        uri: "u1",
                        login: "jane",
                        email: "jane@example.com",
                        fullName: "Jane Good",
                    },
                    permissions: ["VIEW"],
                    inheritedPermissions: [],
                },
            ],
        };
        expect(granteesFromAccessList(list)[0]).toMatchObject({
            name: "Jane Good",
            email: "jane@example.com",
        });
    });
});

describe("permission level ordering", () => {
    it("surfaces an inherited level only when it outranks the direct one", () => {
        expect(effectivePermissionAbove("VIEW", "SHARE")).toBe("SHARE");
        expect(effectivePermissionAbove("SHARE", "EDIT")).toBe("EDIT");
        expect(effectivePermissionAbove("SHARE", "SHARE")).toBeUndefined();
        expect(effectivePermissionAbove("EDIT", "SHARE")).toBeUndefined();
        expect(effectivePermissionAbove("VIEW", undefined)).toBeUndefined();
    });

    it("lists the levels strictly above / below a level, strongest first", () => {
        expect(levelsAbove("VIEW")).toEqual(["EDIT", "SHARE"]);
        expect(levelsAbove("SHARE")).toEqual(["EDIT"]);
        expect(levelsAbove("EDIT")).toEqual([]);
        expect(levelsBelow("EDIT")).toEqual(["SHARE", "VIEW"]);
        expect(levelsBelow("VIEW")).toEqual([]);
    });
});

describe("sortGrantees", () => {
    const user = (id: string, name: string, isSelf = false): IObjectShareGrantee => ({
        id: `user:${id}`,
        kind: "user",
        granteeRef: idRef(id),
        level: "VIEW",
        name,
        isSelf,
    });
    const group = (id: string, name: string): IObjectShareGrantee => ({
        id: `group:${id}`,
        kind: "group",
        granteeRef: idRef(id),
        level: "VIEW",
        name,
    });

    it("orders self first, then groups, then users — each alphabetical by name", () => {
        const rows = [
            user("u2", "Jane Good"),
            group("g2", "Marketing"),
            user("me", "Zoe Admin", true),
            group("g1", "Analysts"),
            user("u1", "Adam Ant"),
        ];
        expect(sortGrantees(rows).map((g) => g.id)).toEqual([
            "user:me", // self, regardless of name
            "group:g1", // Analysts
            "group:g2", // Marketing
            "user:u1", // Adam Ant
            "user:u2", // Jane Good
        ]);
    });

    it("is case-insensitive and falls back to the id for equal names", () => {
        const rows = [user("b", "alice"), user("a", "Alice")];
        // Equal names (base sensitivity) → stable by id: user:a before user:b.
        expect(sortGrantees(rows).map((g) => g.id)).toEqual(["user:a", "user:b"]);
    });

    it("sorts nameless (raw-id) rows by their display fallback and does not mutate the input", () => {
        const rows = [user("zzz", "Bob"), { ...user("aaa", ""), name: undefined }];
        const sorted = sortGrantees(rows);
        // The nameless row displays its raw id "aaa", which sorts before "Bob".
        expect(sorted.map((g) => g.id)).toEqual(["user:aaa", "user:zzz"]);
        // Input array is untouched.
        expect(rows.map((g) => g.id)).toEqual(["user:zzz", "user:aaa"]);
    });
});

describe("mergeGrantees", () => {
    const REF2 = idRef("u2");
    const base: IObjectShareGrantee[] = [
        {
            id: "user:u1",
            kind: "user",
            granteeRef: REF,
            level: "VIEW",
            name: "Adam Ant",
            inheritedLevel: "SHARE",
        },
        { id: "user:u2", kind: "user", granteeRef: REF2, level: "EDIT", name: "Jane Good" },
    ];
    const self: ISelfIdentity = { id: "u1", name: "Adam Ant", email: "adam@example.com" };

    it("returns the fetched rows unchanged when there are no edits", () => {
        expect(mergeGrantees(base, {}, undefined, undefined)).toEqual(
            base.map((g) => ({ ...g, isSelf: false })),
        );
    });

    it("applies a level override and recomposes the displayed level against the inherited one", () => {
        const edits: Record<string, GranteeEdit> = {
            "user:u1": { kind: "level", level: "VIEW", pending: false },
        };
        const [u1] = mergeGrantees(base, edits, undefined, undefined);
        // Direct VIEW under an inherited SHARE → the row shows the EFFECTIVE SHARE
        // (never understating the access), keeps VIEW as the direct grant, and the
        // badge marks the level as inheritance-derived.
        expect(u1).toMatchObject({
            level: "SHARE",
            directLevel: "VIEW",
            effectivePermission: "SHARE",
            pending: undefined,
        });
    });

    it("clears the effective badge when the override reaches the inherited level", () => {
        const edits: Record<string, GranteeEdit> = {
            "user:u1": { kind: "level", level: "EDIT", pending: false },
        };
        const [u1] = mergeGrantees(base, edits, undefined, undefined);
        expect(u1).toMatchObject({ level: "EDIT", effectivePermission: undefined });
    });

    it("marks a pending level edit as saving", () => {
        const edits: Record<string, GranteeEdit> = {
            "user:u2": { kind: "level", level: "VIEW", pending: true },
        };
        const u2 = mergeGrantees(base, edits, undefined, undefined).find((g) => g.id === "user:u2");
        expect(u2).toMatchObject({ level: "VIEW", pending: "saving" });
    });

    it("keeps a removed row visible-but-removing while pending, and drops it once settled", () => {
        // u2 holds a direct grant only — nothing survives its removal.
        const pending: Record<string, GranteeEdit> = { "user:u2": { kind: "removed", pending: true } };
        expect(mergeGrantees(base, pending, undefined, undefined).map((g) => g.id)).toEqual([
            "user:u1",
            "user:u2", // still shown, muted
        ]);
        expect(
            mergeGrantees(base, pending, undefined, undefined).find((g) => g.id === "user:u2"),
        ).toMatchObject({ pending: "removing" });

        const settled: Record<string, GranteeEdit> = { "user:u2": { kind: "removed", pending: false } };
        expect(mergeGrantees(base, settled, undefined, undefined).map((g) => g.id)).toEqual(["user:u1"]);
    });

    it("keeps a settled-removed row as inherited-only when the grantee still inherits access", () => {
        // u1 is directly granted VIEW and inherits SHARE. Removing the direct grant
        // revokes only what this workspace gave: the row must survive at the inherited
        // level rather than vanish and reappear on the next load.
        const settled: Record<string, GranteeEdit> = { "user:u1": { kind: "removed", pending: false } };
        const rows = mergeGrantees(base, settled, undefined, undefined);
        expect(rows.map((g) => g.id)).toEqual(["user:u1", "user:u2"]);
        expect(rows.find((g) => g.id === "user:u1")).toMatchObject({
            level: "SHARE",
            directLevel: undefined,
            effectivePermission: "SHARE",
            pending: undefined,
        });
    });

    it("appends an added row, marking it saving while pending", () => {
        const added: IObjectShareGrantee = {
            id: "group:g1",
            kind: "group",
            granteeRef: idRef("g1"),
            level: "VIEW",
            name: "Marketing",
        };
        const edits: Record<string, GranteeEdit> = {
            "group:g1": { kind: "added", grantee: added, pending: true },
        };
        const rows = mergeGrantees(base, edits, undefined, undefined);
        expect(rows.map((g) => g.id)).toEqual(["user:u1", "user:u2", "group:g1"]);
        expect(rows.find((g) => g.id === "group:g1")).toMatchObject({ pending: "saving" });
    });

    it("keeps an overlay-born row visible (muted) while its removal is in flight", () => {
        // The row was added since the fetch, so base doesn't have it — the removal
        // entry renders it from the superseded added entry it carries.
        const added: IObjectShareGrantee = {
            id: "group:g1",
            kind: "group",
            granteeRef: idRef("g1"),
            level: "VIEW",
            name: "Marketing",
        };
        const edits: Record<string, GranteeEdit> = {
            "group:g1": {
                kind: "removed",
                pending: true,
                settled: { kind: "added", grantee: added, pending: false },
            },
        };
        const rows = mergeGrantees(base, edits, undefined, undefined);
        expect(rows.find((g) => g.id === "group:g1")).toMatchObject({
            name: "Marketing",
            pending: "removing",
        });
    });

    it("marks the caller's own row and backfills its facts from the profile", () => {
        // u1 has a name but no email on the grant; self identity supplies the email.
        const [u1, u2] = mergeGrantees(base, {}, "user:u1", self);
        expect(u1).toMatchObject({ isSelf: true, name: "Adam Ant", email: "adam@example.com" });
        expect(u2).toMatchObject({ isSelf: false });
    });

    it("does not mutate the input rows", () => {
        const edits: Record<string, GranteeEdit> = {
            "user:u1": { kind: "level", level: "SHARE", pending: false },
        };
        mergeGrantees(base, edits, "user:u1", self);
        // The source row keeps its fetched level and gains no self markers.
        expect(base[0].level).toBe("VIEW");
        expect(base[0]).not.toHaveProperty("isSelf");
        expect(base[0]).not.toHaveProperty("email");
    });
});

describe("sortShareableLabels", () => {
    const label = (id: string, title: string, isPrimary = false): IObjectShareLabel => ({
        ref: idRef(id),
        id,
        title,
        isPrimary,
        isDefault: false,
    });

    it("puts the primary label first, then the rest alphabetical by title", () => {
        const labels = [
            label("region", "Account Region"),
            label("name", "Account Name"),
            label("iswon", "Is Won?", true),
            label("id", "Account ID"),
        ];
        expect(sortShareableLabels(labels).map((l) => l.title)).toEqual([
            "Is Won?", // primary, regardless of title
            "Account ID",
            "Account Name",
            "Account Region",
        ]);
    });

    it("is case-insensitive, breaks ties by id, and does not mutate the input", () => {
        const labels = [label("b", "alpha"), label("a", "Alpha")];
        const sorted = sortShareableLabels(labels);
        // Equal titles (base sensitivity) → stable by id: "a" before "b".
        expect(sorted.map((l) => l.id)).toEqual(["a", "b"]);
        expect(labels.map((l) => l.id)).toEqual(["b", "a"]);
    });
});

describe("buildLabelRegrades", () => {
    const label = (id: string, isPrimary = false): IObjectShareLabel => ({
        ref: idRef(id),
        id,
        title: id,
        isPrimary,
        isDefault: false,
    });
    const LABELS = [label("primary", true), label("name"), label("email")];
    const principal = [{ kind: "user" as const, granteeRef: REF, level: "EDIT" as const }];

    it("re-grades in-scope labels at the principal's level", () => {
        const writes = buildLabelRegrades(principal, new Set(["name"]), LABELS);
        expect(writes.map((w) => w.id)).toEqual(["name"]);
        expect(writes[0]!.grantees[0]!.permissions).toEqual(["EDIT", "VIEW"]);
    });

    it("never writes the primary label — a grant here could not be revoked later", () => {
        // The removal diff treats primary access as implicit (see buildLabelMutations), so
        // an explicit primary grant written by a re-grade would outlive the grantee's
        // object access.
        const writes = buildLabelRegrades(principal, new Set(["primary", "name", "email"]), LABELS);
        expect(writes.map((w) => w.id).sort()).toEqual(["email", "name"]);
        // Proof of the asymmetry this guards: a full revoke emits no primary write either.
        const revokes = buildLabelMutations(
            { kind: "user", granteeRef: REF },
            new Set<string>(),
            new Set(["primary", "name", "email"]),
            LABELS,
        );
        expect(revokes).toHaveLength(2);
    });
});
