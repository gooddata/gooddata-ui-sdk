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

    const restrictionIncludes: NonNullable<EntitiesApiGetAllEntitiesAutomationsRequest["include"]> = [
        "visualizationObjects",
        "metrics",
        "attributes",
        "labels",
        "facts",
        "computedAttributes",
        "analyticalDashboards",
    ];

    it("includes the checked objects when unavailable references are requested", async () => {
        expect(await requestedIncludes({ includeUnavailableReferences: true })).toEqual(
            expect.arrayContaining(restrictionIncludes),
        );
    });

    it("requests the analytical dashboard exactly once when unavailable references are requested", async () => {
        const includes = await requestedIncludes({ includeUnavailableReferences: true });

        expect(includes?.filter((include) => include === "analyticalDashboard")).toEqual([
            "analyticalDashboard",
        ]);
    });

    it("does not include the checked objects by default", async () => {
        const includes = await requestedIncludes();

        expect(restrictionIncludes.filter((include) => includes?.includes(include))).toEqual([]);
    });
});
