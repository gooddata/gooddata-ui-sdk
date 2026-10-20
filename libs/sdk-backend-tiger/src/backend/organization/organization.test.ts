// (C) 2026 GoodData Corporation

import { type AxiosResponse } from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiOrganizationOutDocument, type PlatformUsage } from "@gooddata/api-client-tiger";
import * as actionsApi from "@gooddata/api-client-tiger/endpoints/actions";
import * as api from "@gooddata/api-client-tiger/endpoints/entitiesObjects";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerOrganization } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetEntityOrganizations: vi.fn(),
    EntitiesApi_PatchEntityOrganizations: vi.fn(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_AllPlatformUsage: vi.fn(),
}));

const organizationDocument = (
    attributes: Record<string, unknown>,
    relationships?: Record<string, unknown>,
): AxiosResponse<JsonApiOrganizationOutDocument> =>
    ({
        data: {
            data: {
                id: "org",
                type: "organization",
                attributes: { name: "Org", ...attributes },
                relationships,
            },
        },
    }) as AxiosResponse<JsonApiOrganizationOutDocument>;

describe("TigerOrganization", () => {
    const mockAuthCall = vi.fn((callback) => callback({ axios: {}, basePath: "" }));
    let organization: TigerOrganization;

    beforeAll(async () => {
        vi.resetModules();
        const { TigerOrganization } = await import("./index.js");
        organization = new TigerOrganization(mockAuthCall as TigerAuthenticatedCallGuard, "org");
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDescriptor with additional details", () => {
        it("should resolve without bootstrap refs when the organization has no bootstrap user or group", async () => {
            vi.mocked(api.EntitiesApi_GetEntityOrganizations).mockResolvedValue(organizationDocument({}));

            const descriptor = await organization.getDescriptor(true);

            expect(descriptor.bootstrapUser).toBeUndefined();
            expect(descriptor.bootstrapUserGroup).toBeUndefined();
            expect(descriptor.allowedOrigins).toEqual([]);
        });

        it("should return the allowed origins", async () => {
            vi.mocked(api.EntitiesApi_GetEntityOrganizations).mockResolvedValue(
                organizationDocument({ allowedOrigins: ["https://a.com"] }),
            );

            expect((await organization.getDescriptor(true)).allowedOrigins).toEqual(["https://a.com"]);
        });
    });

    describe("updateDescriptor", () => {
        it("should send the allowed origins in the PATCH", async () => {
            vi.mocked(api.EntitiesApi_PatchEntityOrganizations).mockResolvedValue(
                organizationDocument({ allowedOrigins: ["https://a.com"] }),
            );

            const descriptor = await organization.updateDescriptor({ allowedOrigins: ["https://a.com"] });

            const request = vi.mocked(api.EntitiesApi_PatchEntityOrganizations).mock.calls[0][2];
            expect(request.jsonApiOrganizationPatchDocument.data.attributes?.allowedOrigins).toEqual([
                "https://a.com",
            ]);
            expect(descriptor.allowedOrigins).toEqual(["https://a.com"]);
            expect(descriptor.bootstrapUser).toBeUndefined();
        });

        it("should not send allowed origins when the update does not set them", async () => {
            vi.mocked(api.EntitiesApi_PatchEntityOrganizations).mockResolvedValue(organizationDocument({}));

            await organization.updateDescriptor({ earlyAccessValues: ["x"] });

            const request = vi.mocked(api.EntitiesApi_PatchEntityOrganizations).mock.calls[0][2];
            expect(JSON.stringify(request.jsonApiOrganizationPatchDocument)).not.toContain("allowedOrigins");
        });
    });

    describe("getPlatformUsage", () => {
        it("should keep a missing count undefined", async () => {
            vi.mocked(actionsApi.ActionsApi_AllPlatformUsage).mockResolvedValue({
                data: [{ name: "WorkspaceCount" }, { name: "UserCount", count: 3 }],
            } as AxiosResponse<PlatformUsage[]>);

            expect(await organization.getPlatformUsage()).toEqual([
                { name: "WorkspaceCount", count: undefined },
                { name: "UserCount", count: 3 },
            ]);
        });
    });
});
