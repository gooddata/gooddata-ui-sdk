// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type ObjectPermissionsObjectKind, idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { TigerWorkspaceObjectPermissionsService } from "./index.js";

const WORKSPACE = "ws";

function createService(meta: { permissions?: string[] } | undefined) {
    const axiosRequest = vi.fn(async () => ({ data: { data: { id: "obj", meta } } }));
    const client = { axios: { request: axiosRequest }, basePath: "" };
    const authCall = vi.fn((handler: (c: typeof client) => unknown) => handler(client));
    const service = new TigerWorkspaceObjectPermissionsService(
        authCall as unknown as TigerAuthenticatedCallGuard,
        WORKSPACE,
    );
    return { service, axiosRequest };
}

describe("TigerWorkspaceObjectPermissionsService.getPermissionsForCurrentUser", () => {
    it.each<[ObjectPermissionsObjectKind, string]>([
        ["attribute", "attributes"],
        ["label", "labels"],
        ["fact", "facts"],
        ["measure", "metrics"],
        ["computedAttribute", "computedAttributes"],
        ["insight", "visualizationObjects"],
    ])("reads the %s's own permissions meta", async (kind, collection) => {
        const { service, axiosRequest } = createService({ permissions: ["SHARE", "VIEW"] });

        const permissions = await service.getPermissionsForCurrentUser({ kind, ref: idRef("obj") });

        expect(permissions).toEqual(["SHARE", "VIEW"]);
        expect(axiosRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringMatching(
                    new RegExp(
                        `/api/v1/entities/workspaces/${WORKSPACE}/${collection}/obj\\?.*metaInclude=permissions`,
                    ),
                ),
            }),
        );
    });

    it("answers no permissions when the backend sends no meta", async () => {
        const { service } = createService(undefined);

        await expect(
            service.getPermissionsForCurrentUser({ kind: "insight", ref: idRef("obj") }),
        ).resolves.toEqual([]);
    });
});
