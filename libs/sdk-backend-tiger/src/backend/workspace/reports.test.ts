// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuiltInReportPageLayouts, idRef } from "@gooddata/sdk-model";

const getAllPageLayouts = vi.fn();
const getPageLayout = vi.fn();
const updatePageLayout = vi.fn();
const deletePageLayout = vi.fn();
const getAllTemplates = vi.fn();
const getAllReports = vi.fn();

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesReportPageLayouts: (...args: unknown[]) => getAllPageLayouts(...args),
    EntitiesApi_GetEntityReportPageLayouts: (...args: unknown[]) => getPageLayout(...args),
    EntitiesApi_UpdateEntityReportPageLayouts: (...args: unknown[]) => updatePageLayout(...args),
    EntitiesApi_DeleteEntityReportPageLayouts: (...args: unknown[]) => deletePageLayout(...args),
    EntitiesApi_CreateEntityReportPageLayouts: vi.fn(),
    EntitiesApi_GetAllEntitiesReportTemplates: (...args: unknown[]) => getAllTemplates(...args),
    EntitiesApi_GetEntityReportTemplates: vi.fn(),
    EntitiesApi_CreateEntityReportTemplates: vi.fn(),
    EntitiesApi_UpdateEntityReportTemplates: vi.fn(),
    EntitiesApi_DeleteEntityReportTemplates: vi.fn(),
    EntitiesApi_GetAllEntitiesReports: (...args: unknown[]) => getAllReports(...args),
    EntitiesApi_GetEntityReports: vi.fn(),
    EntitiesApi_CreateEntityReports: vi.fn(),
    EntitiesApi_UpdateEntityReports: vi.fn(),
    EntitiesApi_DeleteEntityReports: vi.fn(),
}));

const { TigerWorkspaceReportsService } = await import("./reports.js");

const authCall = (<T>(fn: (client: unknown) => Promise<T>) => fn({ axios: {}, basePath: "" })) as never;

function newService() {
    return new TigerWorkspaceReportsService(authCall, "ws1");
}

const builtInRef = BuiltInReportPageLayouts[0]!.ref;

beforeEach(() => {
    vi.clearAllMocks();
    getAllPageLayouts.mockResolvedValue({ data: { data: [] } });
    getAllTemplates.mockResolvedValue({ data: { data: [] } });
    getAllReports.mockResolvedValue({ data: { data: [] } });
});

describe("TigerWorkspaceReportsService page layouts", () => {
    it("serves the built-in layouts ahead of the persisted ones", async () => {
        getAllPageLayouts.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: "layout1",
                        type: "reportPageLayout",
                        attributes: { title: "Mine", content: { version: "1" } },
                    },
                ],
            },
        });

        const layouts = await newService().getReportPageLayouts();

        expect(layouts).toHaveLength(BuiltInReportPageLayouts.length + 1);
        expect(layouts.slice(0, BuiltInReportPageLayouts.length)).toEqual([...BuiltInReportPageLayouts]);
        expect(layouts.at(-1)!.title).toBe("Mine");
    });

    it("resolves a built-in layout without calling the backend", async () => {
        await expect(newService().getReportPageLayout(builtInRef)).resolves.toEqual(
            BuiltInReportPageLayouts[0],
        );
        expect(getPageLayout).not.toHaveBeenCalled();
    });

    it("refuses to update or delete a built-in layout", async () => {
        const service = newService();
        const builtIn = BuiltInReportPageLayouts[0]!;

        await expect(service.updateReportPageLayout(builtIn)).rejects.toThrow(/built-in/);
        await expect(service.deleteReportPageLayout(builtInRef)).rejects.toThrow(/built-in/);
        expect(updatePageLayout).not.toHaveBeenCalled();
        expect(deletePageLayout).not.toHaveBeenCalled();
    });

    it("requests the audit users and resolves them from the included resources", async () => {
        getAllPageLayouts.mockResolvedValueOnce({
            data: {
                data: [
                    {
                        id: "layout1",
                        type: "reportPageLayout",
                        attributes: { title: "Mine", content: { version: "1" } },
                        relationships: { createdBy: { data: { id: "ada", type: "userIdentifier" } } },
                    },
                ],
                included: [{ id: "ada", type: "userIdentifier", attributes: { firstname: "Ada" } }],
            },
        });

        const layouts = await newService().getReportPageLayouts();

        expect(getAllPageLayouts).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ include: ["createdBy", "modifiedBy"] }),
        );
        expect(layouts.at(-1)!.createdBy).toMatchObject({ login: "ada", firstName: "Ada" });
    });

    it("deletes a workspace layout by its identifier", async () => {
        deletePageLayout.mockResolvedValue({});

        await newService().deleteReportPageLayout(idRef("layout1", "reportPageLayout"));

        expect(deletePageLayout).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ workspaceId: "ws1", objectId: "layout1" }),
        );
    });
});

describe("TigerWorkspaceReportsService listings", () => {
    it("asks the backend for the most recently changed templates first", async () => {
        await newService().getReportTemplates();

        expect(getAllTemplates).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ sort: ["modifiedAt,desc"] }),
        );
    });

    it("asks the backend for the most recently changed reports first", async () => {
        await newService().getReports();

        expect(getAllReports).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ sort: ["modifiedAt,desc"] }),
        );
    });
});
