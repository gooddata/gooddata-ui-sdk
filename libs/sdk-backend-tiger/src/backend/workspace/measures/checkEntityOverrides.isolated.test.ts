// (C) 2026 GoodData Corporation

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type IdentifierDuplications } from "@gooddata/api-client-tiger";
import { ActionsApi_CheckEntityOverrides } from "@gooddata/api-client-tiger/endpoints/actions";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { axiosResponse } from "../../../utils/axiosResponse.test.helpers.js";

import { type TigerWorkspaceMeasures as TigerWorkspaceMeasuresClass } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/actions", () => ({
    ActionsApi_CheckEntityOverrides: vi.fn(),
    ActionsApi_SetCertification: vi.fn(),
}));

let TigerWorkspaceMeasures: typeof TigerWorkspaceMeasuresClass;

beforeAll(async () => {
    vi.resetModules();
    ({ TigerWorkspaceMeasures } = await import("./index.js"));
});

const WORKSPACE = "ws-1";

const authCall = vi.fn(async (callback) =>
    callback({
        axios: {},
        basePath: "",
    }),
) as TigerAuthenticatedCallGuard;

describe("TigerWorkspaceMeasures.checkEntityOverrides", () => {
    beforeEach(() => {
        vi.mocked(ActionsApi_CheckEntityOverrides).mockReset();
    });

    it("should check the identifiers as metrics of the workspace", async () => {
        vi.mocked(ActionsApi_CheckEntityOverrides).mockResolvedValue(
            axiosResponse<IdentifierDuplications[]>([]),
        );

        await new TigerWorkspaceMeasures(authCall, WORKSPACE).checkEntityOverrides(["m1", "m2"]);

        expect(ActionsApi_CheckEntityOverrides).toHaveBeenCalledWith({}, "", {
            workspaceId: WORKSPACE,
            hierarchyObjectIdentification: [
                { id: "m1", type: "metric" },
                { id: "m2", type: "metric" },
            ],
        });
    });

    it("should return the used metric identifiers with their origins", async () => {
        vi.mocked(ActionsApi_CheckEntityOverrides).mockResolvedValue(
            axiosResponse<IdentifierDuplications[]>([
                { id: "m1", type: "metric", origins: ["parent-ws"] },
                { id: "m1", type: "fact", origins: ["other-ws"] },
            ]),
        );

        const result = await new TigerWorkspaceMeasures(authCall, WORKSPACE).checkEntityOverrides(["m1"]);

        expect(result).toEqual([{ identifier: "m1", origins: ["parent-ws"] }]);
    });

    it("should not call the backend when there is nothing to check", async () => {
        const result = await new TigerWorkspaceMeasures(authCall, WORKSPACE).checkEntityOverrides([]);

        expect(result).toEqual([]);
        expect(ActionsApi_CheckEntityOverrides).not.toHaveBeenCalled();
    });
});
