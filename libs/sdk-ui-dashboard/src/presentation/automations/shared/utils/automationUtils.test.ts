// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IUser, uriRef } from "@gooddata/sdk-model";

import { convertUserToAutomationRecipient } from "./automationUtils.js";

const currentUser: IUser = {
    ref: uriRef("/users/john.id"),
    login: "john.id",
    email: "john@example.com",
    fullName: "John Doe",
    firstName: "John",
    lastName: "Doe",
};

describe("convertUserToAutomationRecipient", () => {
    it("builds the default recipient from the dashboard user", () => {
        expect(convertUserToAutomationRecipient(currentUser)).toEqual({
            id: "john.id",
            email: "john@example.com",
            name: "John Doe",
            type: "user",
        });
    });
});
