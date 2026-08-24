// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspaceUsersQuery } from "@gooddata/sdk-backend-spi";
import { type IWorkspaceUser, uriRef } from "@gooddata/sdk-model";

import { recordedBackend } from "./index.js";

function workspaceUser(login: string, email: string, fullName: string): IWorkspaceUser {
    return {
        ref: uriRef(`/users/${login}`),
        uri: `/users/${login}`,
        login,
        email,
        fullName,
    };
}

const john = workspaceUser("john.doe", "john@example.com", "John Doe");
const jane = workspaceUser("jane.roe", "jane@example.com", "Jane Roe");
const zoe = workspaceUser("zoe.zed", "zoe@other.com", "Zoe Zed");

function usersQuery(users: IWorkspaceUser[] = [john, jane, zoe]): IWorkspaceUsersQuery {
    return recordedBackend({}, { userManagement: { users: { users } } })
        .workspace("workspace")
        .users();
}

describe("RecordedWorkspaceUsersQuery", () => {
    it("returns all configured users when no options are specified", async () => {
        expect((await usersQuery().query()).items).toEqual([john, jane, zoe]);
        expect(await usersQuery().queryAll()).toEqual([john, jane, zoe]);
    });

    it("filters by a case-insensitive substring of the full name", async () => {
        const result = await usersQuery().withOptions({ search: "ROE" }).query();

        expect(result.items).toEqual([jane]);
    });

    it("filters by a substring of the login", async () => {
        const result = await usersQuery().withOptions({ search: "zoe.z" }).query();

        expect(result.items).toEqual([zoe]);
    });

    it("filters by a substring of the email", async () => {
        const result = await usersQuery().withOptions({ search: "@other.com" }).query();

        expect(result.items).toEqual([zoe]);
    });

    it("returns no items when nothing matches the search", async () => {
        const result = await usersQuery().withOptions({ search: "nobody" }).query();

        expect(result.items).toEqual([]);
        expect(result.totalCount).toBe(0);
    });

    it("caps the first page by the requested limit", async () => {
        const result = await usersQuery().withOptions({ limit: 2 }).query();

        expect(result.items).toEqual([john, jane]);
        expect(result.limit).toBe(2);
        expect(result.totalCount).toBe(3);
    });

    it("starts the page at the requested offset", async () => {
        const result = await usersQuery().withOptions({ limit: 1, offset: 2 }).query();

        expect(result.items).toEqual([zoe]);
        expect(result.offset).toBe(2);
    });

    it("applies the limit to the search results only", async () => {
        const result = await usersQuery().withOptions({ search: "example.com", limit: 1 }).query();

        expect(result.items).toEqual([john]);
        expect(result.totalCount).toBe(2);
    });

    it("applies the search but not the limit in queryAll", async () => {
        const result = await usersQuery().withOptions({ search: "example.com", limit: 1 }).queryAll();

        expect(result).toEqual([john, jane]);
    });
});
