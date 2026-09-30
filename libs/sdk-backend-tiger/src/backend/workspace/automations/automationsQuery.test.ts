// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { type EntitiesApiGetAllEntitiesAutomationsRequest } from "@gooddata/api-client-tiger";
import { type IGetAutomationsQueryOptions } from "@gooddata/sdk-backend-spi";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

import { AutomationsQuery } from "./automationsQuery.js";

const { getAllEntitiesAutomations } = vi.hoisted(() => ({
    getAllEntitiesAutomations:
        vi.fn<
            (
                axios: unknown,
                basePath: string,
                request: EntitiesApiGetAllEntitiesAutomationsRequest,
            ) => Promise<unknown>
        >(),
}));

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesAutomations: getAllEntitiesAutomations,
}));

const authCall = ((call: (client: unknown) => unknown) =>
    call({ axios: {}, basePath: "" })) as unknown as TigerAuthenticatedCallGuard;

const requestedIncludes = async (options?: IGetAutomationsQueryOptions) => {
    await new AutomationsQuery(authCall, { workspaceId: "workspace" }, options).query();
    return getAllEntitiesAutomations.mock.calls[0][2].include;
};

describe("AutomationsQuery", () => {
    beforeEach(() => {
        getAllEntitiesAutomations.mockReset();
        getAllEntitiesAutomations.mockResolvedValue({
            data: { data: [], included: [], meta: { page: { totalElements: 0 } } },
        });
    });

    it("includes visualizations when unavailable references are requested", async () => {
        expect(await requestedIncludes({ includeUnavailableReferences: true })).toContain(
            "visualizationObjects",
        );
    });

    it("does not include visualizations by default", async () => {
        expect(await requestedIncludes()).not.toContain("visualizationObjects");
    });
});
