// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuiltInReportPageLayouts, idRef } from "@gooddata/sdk-model";

const getAllPageLayouts = vi.fn();
const getPageLayout = vi.fn();
const updatePageLayout = vi.fn();
const deletePageLayout = vi.fn();

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesReportPageLayouts: (...args: unknown[]) => getAllPageLayouts(...args),
    EntitiesApi_GetEntityReportPageLayouts: (...args: unknown[]) => getPageLayout(...args),
    EntitiesApi_UpdateEntityReportPageLayouts: (...args: unknown[]) => updatePageLayout(...args),
    EntitiesApi_DeleteEntityReportPageLayouts: (...args: unknown[]) => deletePageLayout(...args),
    EntitiesApi_CreateEntityReportPageLayouts: vi.fn(),
    EntitiesApi_GetAllEntitiesReportTemplates: vi.fn(),
    EntitiesApi_GetEntityReportTemplates: vi.fn(),
    EntitiesApi_CreateEntityReportTemplates: vi.fn(),
    EntitiesApi_UpdateEntityReportTemplates: vi.fn(),
    EntitiesApi_DeleteEntityReportTemplates: vi.fn(),
    EntitiesApi_GetAllEntitiesReports: vi.fn(),
    EntitiesApi_GetEntityReports: vi.fn(),
    EntitiesApi_CreateEntityReports: vi.fn(),
    EntitiesApi_UpdateEntityReports: vi.fn(),
    EntitiesApi_DeleteEntityReports: vi.fn(),
}));

const getSettings = vi.fn();
const setReportsBrandKit = vi.fn();
const deleteReportsBrandKit = vi.fn();

vi.mock("./settings/index.js", () => ({
    TigerWorkspaceSettings: class {
        getSettings = getSettings;
        setReportsBrandKit = setReportsBrandKit;
        deleteReportsBrandKit = deleteReportsBrandKit;
    },
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

describe("TigerWorkspaceReportsService brand kit", () => {
    it("sanitizes the kit resolved from the workspace settings", async () => {
        getSettings.mockResolvedValue({
            reportsBrandKit: {
                version: "1",
                assets: { logo: "https://cdn.example.com/logo.svg", images: "no" },
            },
        });

        await expect(newService().getBrandKit()).resolves.toEqual({
            version: "1",
            assets: { logo: "https://cdn.example.com/logo.svg" },
        });
    });

    it("returns undefined when no kit is set", async () => {
        getSettings.mockResolvedValue({});

        await expect(newService().getBrandKit()).resolves.toBeUndefined();
    });

    it("stores the sanitized kit and refuses a foreign one", async () => {
        const service = newService();

        await service.setBrandKit({
            version: "1",
            assets: { logo: "https://cdn.example.com/logo.svg", images: "no" },
        } as never);
        expect(setReportsBrandKit).toHaveBeenCalledWith({
            version: "1",
            assets: { logo: "https://cdn.example.com/logo.svg" },
        });

        await expect(service.setBrandKit({ version: "2" } as never)).rejects.toThrow(/not a valid brand kit/);
    });
});
