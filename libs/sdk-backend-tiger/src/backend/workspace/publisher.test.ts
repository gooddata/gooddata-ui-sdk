// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { DefaultPublisherPageTemplates, idRef } from "@gooddata/sdk-model";

const getAllPageLayouts = vi.fn();
const getPageLayoutEntity = vi.fn();
const updatePageLayoutEntity = vi.fn();
const deletePageLayoutEntity = vi.fn();
const getAllTemplates = vi.fn();
const getAllDocuments = vi.fn();

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesReportPageLayouts: (...args: unknown[]) => getAllPageLayouts(...args),
    EntitiesApi_GetEntityReportPageLayouts: (...args: unknown[]) => getPageLayoutEntity(...args),
    EntitiesApi_UpdateEntityReportPageLayouts: (...args: unknown[]) => updatePageLayoutEntity(...args),
    EntitiesApi_DeleteEntityReportPageLayouts: (...args: unknown[]) => deletePageLayoutEntity(...args),
    EntitiesApi_CreateEntityReportPageLayouts: vi.fn(),
    EntitiesApi_GetAllEntitiesReportTemplates: (...args: unknown[]) => getAllTemplates(...args),
    EntitiesApi_GetEntityReportTemplates: vi.fn(),
    EntitiesApi_CreateEntityReportTemplates: vi.fn(),
    EntitiesApi_UpdateEntityReportTemplates: vi.fn(),
    EntitiesApi_DeleteEntityReportTemplates: vi.fn(),
    EntitiesApi_GetAllEntitiesReports: (...args: unknown[]) => getAllDocuments(...args),
    EntitiesApi_GetEntityReports: vi.fn(),
    EntitiesApi_CreateEntityReports: vi.fn(),
    EntitiesApi_UpdateEntityReports: vi.fn(),
    EntitiesApi_DeleteEntityReports: vi.fn(),
}));

const { TigerWorkspacePublisherService } = await import("./publisher.js");

const authCall = (<T>(fn: (client: unknown) => Promise<T>) => fn({ axios: {}, basePath: "" })) as never;

function newService() {
    return new TigerWorkspacePublisherService(authCall, "ws1");
}

const builtInRef = DefaultPublisherPageTemplates[0]!.ref;

beforeEach(() => {
    vi.clearAllMocks();
    getAllPageLayouts.mockResolvedValue({ data: { data: [] } });
    getAllTemplates.mockResolvedValue({ data: { data: [] } });
    getAllDocuments.mockResolvedValue({ data: { data: [] } });
});

describe("TigerWorkspacePublisherService page templates", () => {
    it("serves the default page templates ahead of the persisted ones", async () => {
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

        const layouts = await newService().getPageTemplates();

        expect(layouts).toHaveLength(DefaultPublisherPageTemplates.length + 1);
        expect(layouts.slice(0, DefaultPublisherPageTemplates.length)).toEqual([
            ...DefaultPublisherPageTemplates,
        ]);
        expect(layouts.at(-1)!.title).toBe("Mine");
    });

    it("resolves a default page template without calling the backend", async () => {
        await expect(newService().getPageTemplate(builtInRef)).resolves.toEqual(
            DefaultPublisherPageTemplates[0],
        );
        expect(getPageLayoutEntity).not.toHaveBeenCalled();
    });

    it("refuses to update or delete a default page template", async () => {
        const service = newService();
        const builtIn = DefaultPublisherPageTemplates[0]!;

        await expect(service.updatePageTemplate(builtIn)).rejects.toThrow(/one of the defaults/);
        await expect(service.deletePageTemplate(builtInRef)).rejects.toThrow(/one of the defaults/);
        expect(updatePageLayoutEntity).not.toHaveBeenCalled();
        expect(deletePageLayoutEntity).not.toHaveBeenCalled();
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

        const layouts = await newService().getPageTemplates();

        expect(getAllPageLayouts).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ include: ["createdBy", "modifiedBy"] }),
        );
        expect(layouts.at(-1)!.createdBy).toMatchObject({ login: "ada", firstName: "Ada" });
    });

    it("deletes a workspace layout by its identifier", async () => {
        deletePageLayoutEntity.mockResolvedValue({});

        await newService().deletePageTemplate(idRef("layout1", "reportPageLayout"));

        expect(deletePageLayoutEntity).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ workspaceId: "ws1", objectId: "layout1" }),
        );
    });
});

describe("TigerWorkspacePublisherService listings", () => {
    it("asks the backend for the most recently changed templates first", async () => {
        await newService().getDocumentTemplates();

        expect(getAllTemplates).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ sort: ["modifiedAt,desc"] }),
        );
    });

    it("asks the backend for the most recently changed documents first", async () => {
        await newService().getDocuments();

        expect(getAllDocuments).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ sort: ["modifiedAt,desc"] }),
        );
    });
});
