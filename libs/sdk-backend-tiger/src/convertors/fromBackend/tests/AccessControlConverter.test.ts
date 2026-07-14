// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    convertUserAssignee,
    convertUserGroupAssignee,
    convertUserGroupPermission,
    convertUserPermission,
} from "../AccessControlConverter.js";

// Pins the collapse chains that sdk-ui-ext's userIdentityFacts inverts
// (objectShareController.helpers.ts) — reordering them mis-classifies there.
describe("AccessControlConverter identity collapse", () => {
    it("convertUserPermission collapses missing name and email onto the id", () => {
        expect(convertUserPermission({ id: "u1" }).user).toEqual({
            ref: idRef("u1"),
            uri: "u1",
            email: "u1",
            login: "u1",
            fullName: "u1",
        });
    });

    it("convertUserPermission falls back to the email as the name before the id", () => {
        expect(convertUserPermission({ id: "u1", email: "jane@example.com" }).user).toMatchObject({
            fullName: "jane@example.com",
            email: "jane@example.com",
        });
        expect(
            convertUserPermission({ id: "u1", name: "Jane", email: "jane@example.com" }).user,
        ).toMatchObject({ fullName: "Jane", email: "jane@example.com" });
    });

    it("convertUserAssignee collapses only the name; the email stays raw", () => {
        expect(convertUserAssignee({ id: "u1" })).toEqual({
            type: "user",
            ref: idRef("u1"),
            name: "u1",
            email: undefined,
            status: "ENABLED",
        });
        expect(convertUserAssignee({ id: "u1", email: "jane@example.com" })).toMatchObject({
            name: "jane@example.com",
            email: "jane@example.com",
        });
    });

    it("group converters collapse a missing name onto the id", () => {
        expect(convertUserGroupPermission({ id: "g1" }).userGroup).toEqual({
            ref: idRef("g1"),
            name: "g1",
        });
        expect(convertUserGroupAssignee({ id: "g1" })).toEqual({
            type: "group",
            ref: idRef("g1"),
            name: "g1",
        });
    });
});
