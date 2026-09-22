// (C) 2026 GoodData Corporation

import { type AxiosInstance } from "axios";
import { describe, expect, it } from "vitest";

import { ProfileApi_GetCurrentWithDetails } from "./profile.js";

const USER_ID = "0a294638-514d-4148-acdb-b7d6176d20d7";
// Whatever the auth provider supplied; it need not be a person's name.
const AUTH_NAME = "auth-provider-name";

// The bare profile carries no name parts and no email, so the entity read is the only source of
// either; its name is whatever the auth provider supplied, which need not be a person's name.
function axiosOf(attributes: Record<string, string>): AxiosInstance {
    return {
        get: async () => ({ data: { userId: USER_ID, name: AUTH_NAME }, headers: {} }),
        request: async () => ({
            data: { data: { id: USER_ID, type: "user", attributes } },
            headers: {},
        }),
    } as unknown as AxiosInstance;
}

const profileOf = (attributes: Record<string, string>) =>
    ProfileApi_GetCurrentWithDetails(axiosOf(attributes));

describe("ProfileApi_GetCurrentWithDetails", () => {
    it("names a user from both of their name parts", async () => {
        await expect(profileOf({ firstname: "My", lastname: "Duong" })).resolves.toMatchObject({
            name: "My Duong",
            firstName: "My",
            lastName: "Duong",
        });
    });

    it("names a user who has only a first name", async () => {
        await expect(profileOf({ firstname: "My" })).resolves.toMatchObject({
            name: "My",
            firstName: "My",
        });
    });

    it("names a user who has only a last name", async () => {
        await expect(profileOf({ lastname: "Duong" })).resolves.toMatchObject({
            name: "Duong",
            lastName: "Duong",
        });
    });

    it("leaves the profile's own name alone for a user with neither name part", async () => {
        await expect(profileOf({ email: "my.duong@acme.test" })).resolves.toMatchObject({
            name: AUTH_NAME,
            email: "my.duong@acme.test",
        });
    });

    it("carries the email of a user who also has a name", async () => {
        await expect(
            profileOf({ firstname: "My", lastname: "Duong", email: "my.duong@acme.test" }),
        ).resolves.toMatchObject({ name: "My Duong", email: "my.duong@acme.test" });
    });
});
