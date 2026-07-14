// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IObjectAccessList, idRef } from "@gooddata/sdk-model";

import {
    assigneeIdentityFacts,
    granteeDisplayPair,
    granteesFromAccessList,
    userIdentityFacts,
} from "../objectShareController.helpers.js";
import type { IObjectShareGrantee } from "../objectShareController.types.js";

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
