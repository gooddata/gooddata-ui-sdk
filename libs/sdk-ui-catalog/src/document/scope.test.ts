// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IUser, IWorkspacePermissions } from "@gooddata/sdk-model";

import { type IDocumentFilter, getDocumentOwner, scopeDocumentFilter } from "./scope.js";

const user = { login: "me" } as IUser;

function permissions(granted: Partial<IWorkspacePermissions>): IWorkspacePermissions {
    return granted as IWorkspacePermissions;
}

describe("getDocumentOwner", () => {
    it.each<[string, IUser | undefined, IWorkspacePermissions | undefined]>([
        ["the user may create documents", user, permissions({ canCreateDocument: true })],
        ["permissions are unknown", user, undefined],
        ["the user is unknown", undefined, permissions({})],
    ])("shows every document when %s", (_, currentUser, granted) => {
        expect(getDocumentOwner(currentUser, granted)).toBeUndefined();
    });

    it("shows a user without the create grant their own documents", () => {
        expect(getDocumentOwner(user, permissions({ canAnalyzeWorkspace: true }))).toBe("me");
    });
});

describe("scopeDocumentFilter", () => {
    it("keeps the filter as it is without an owner", () => {
        const filter: IDocumentFilter = { origin: "PARENTS", createdBy: ["other"] };
        expect(scopeDocumentFilter(filter, undefined)).toBe(filter);
    });

    it.each<[string, IDocumentFilter]>([
        ["no creator filter", { origin: "ALL" }],
        ["a creator filter with the owner", { origin: "NATIVE", createdBy: ["me", "other"] }],
        ["other creators left out", { origin: "ALL", excludeCreatedBy: ["third"] }],
    ])("narrows to the owner's native documents with %s", (_, filter) => {
        expect(scopeDocumentFilter(filter, "me")).toEqual({ origin: "NATIVE", createdBy: ["me"] });
    });

    it.each<[string, IDocumentFilter]>([
        ["only inherited documents are asked for", { origin: "PARENTS" }],
        ["only someone else's documents are asked for", { origin: "ALL", createdBy: ["other"] }],
        ["the owner's documents are left out", { origin: "ALL", excludeCreatedBy: ["me"] }],
    ])("leaves nothing to match when %s", (_, filter) => {
        expect(scopeDocumentFilter(filter, "me")).toBeUndefined();
    });
});
