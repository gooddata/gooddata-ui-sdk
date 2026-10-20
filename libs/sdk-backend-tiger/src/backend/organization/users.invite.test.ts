// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import * as actionsApi from "@gooddata/api-client-tiger/endpoints/actions";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type OrganizationUsersService } from "./users.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_ProcessInvitation: vi.fn(),
}));

const invitation = { userId: "john", email: "john@example.com", firstName: "John" };

describe("OrganizationUsersService.inviteUser", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let service: OrganizationUsersService;

    beforeAll(async () => {
        vi.resetModules();
        const { OrganizationUsersService } = await import("./users.js");
        service = new OrganizationUsersService(mockAuthCall as TigerAuthenticatedCallGuard);
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should send the invitation to the backend", async () => {
        vi.mocked(actionsApi.ActionsApi_ProcessInvitation).mockResolvedValue({
            status: 204,
        } as AxiosResponse);

        await service.inviteUser(invitation);

        expect(actionsApi.ActionsApi_ProcessInvitation).toHaveBeenCalledWith({}, "", { invitation });
    });

    it("should reject when the backend does not accept the invitation", async () => {
        vi.mocked(actionsApi.ActionsApi_ProcessInvitation).mockResolvedValue({
            status: 200,
        } as AxiosResponse);

        await expect(service.inviteUser(invitation)).rejects.toThrow();
    });
});
