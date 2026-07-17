// (C) 2026 GoodData Corporation

import { type AxiosPromise } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    EntitiesApi_CreateEntityWorkspaceColorPalettes,
    EntitiesApi_CreateEntityWorkspaceThemes,
    EntitiesApi_DeleteEntityWorkspaceColorPalettes,
    EntitiesApi_DeleteEntityWorkspaceThemes,
    EntitiesApi_GetAllEntitiesColorPalettes,
    EntitiesApi_GetAllEntitiesThemes,
    EntitiesApi_GetAllEntitiesWorkspaceColorPalettes,
    EntitiesApi_GetAllEntitiesWorkspaceThemes,
    EntitiesApi_UpdateEntityWorkspaceColorPalettes,
    EntitiesApi_UpdateEntityWorkspaceThemes,
} from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { getSettingsForCurrentUser } from "../settings/index.js";

import { TigerWorkspaceStyling } from "./index.js";
import { DefaultColorPalette } from "./mocks/colorPalette.js";
import { DefaultTheme } from "./mocks/theme.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_CreateEntityWorkspaceColorPalettes: vi.fn(),
    EntitiesApi_CreateEntityWorkspaceThemes: vi.fn(),
    EntitiesApi_DeleteEntityWorkspaceColorPalettes: vi.fn(),
    EntitiesApi_DeleteEntityWorkspaceThemes: vi.fn(),
    EntitiesApi_GetAllEntitiesColorPalettes: vi.fn(),
    EntitiesApi_GetAllEntitiesThemes: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaceColorPalettes: vi.fn(),
    EntitiesApi_GetAllEntitiesWorkspaceThemes: vi.fn(),
    EntitiesApi_UpdateEntityWorkspaceColorPalettes: vi.fn(),
    EntitiesApi_UpdateEntityWorkspaceThemes: vi.fn(),
}));

// A shared settings-service double so we can assert the scope forwarded by setActiveTheme/setActiveColorPalette.
const { settingsServiceMock } = vi.hoisted(() => ({
    settingsServiceMock: {
        setTheme: vi.fn(),
        setColorPalette: vi.fn(),
        deleteTheme: vi.fn(),
        deleteColorPalette: vi.fn(),
        getSettings: vi.fn(),
    },
}));

vi.mock("../settings/index.js", () => ({
    getSettingsForCurrentUser: vi.fn(),
    // Regular function (not an arrow) so it is usable as a constructor under `new`; returning an object
    // makes `new TigerWorkspaceSettings(...)` yield our shared spy double.
    TigerWorkspaceSettings: vi.fn(function () {
        return settingsServiceMock;
    }),
}));

const WORKSPACE = "ws-1";

const authCall = vi.fn(async (callback) =>
    callback({
        axios: {},
        basePath: "",
    }),
) as TigerAuthenticatedCallGuard;

const themeContent = { properties: { chart: { backgroundColor: "#fff" } } };
const paletteContent = { colorPalette: [{ guid: "brand", fill: { r: 1, g: 2, b: 3 } }] };

const listResponse = (data: unknown[]) => ({ data: { data } }) as unknown as Awaited<AxiosPromise>;

describe("TigerWorkspaceStyling active theme resolution", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("resolves a workspace-scoped active theme from the workspace themes collection", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeTheme: { id: "t-1", type: "workspaceTheme" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceThemes).mockResolvedValue(
            listResponse([{ attributes: { content: themeContent } }]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const theme = await styling.getTheme();

        expect(theme).toEqual(themeContent);
        expect(vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceThemes).mock.calls[0][2]).toEqual({
            workspaceId: WORKSPACE,
            filter: `id=="t-1"`,
        });
        // No cross-scope fallback: the org themes collection must not be touched.
        expect(EntitiesApi_GetAllEntitiesThemes).not.toHaveBeenCalled();
    });

    it("resolves an org-scoped active theme from the organization themes collection", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeTheme: { id: "t-1", type: "theme" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesThemes).mockResolvedValue(
            listResponse([{ attributes: { content: themeContent } }]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const theme = await styling.getTheme();

        expect(theme).toEqual(themeContent);
        expect(vi.mocked(EntitiesApi_GetAllEntitiesThemes).mock.calls[0][2]).toEqual({
            filter: `id=="t-1"`,
        });
        expect(EntitiesApi_GetAllEntitiesWorkspaceThemes).not.toHaveBeenCalled();
    });

    it("returns the default theme without falling back to the org scope when the workspace object is missing", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeTheme: { id: "missing", type: "workspaceTheme" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceThemes).mockResolvedValue(listResponse([]));

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const theme = await styling.getTheme();

        expect(theme).toEqual(DefaultTheme);
        expect(EntitiesApi_GetAllEntitiesThemes).not.toHaveBeenCalled();
    });

    it("returns the default theme when no active theme is configured", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({} as any);

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const theme = await styling.getTheme();

        expect(theme).toEqual(DefaultTheme);
        expect(EntitiesApi_GetAllEntitiesWorkspaceThemes).not.toHaveBeenCalled();
        expect(EntitiesApi_GetAllEntitiesThemes).not.toHaveBeenCalled();
    });
});

describe("TigerWorkspaceStyling active color palette resolution", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("resolves a workspace-scoped active color palette from the workspace collection", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeColorPalette: { id: "cp-1", type: "workspaceColorPalette" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).mockResolvedValue(
            listResponse([{ attributes: { content: paletteContent } }]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const palette = await styling.getColorPalette();

        expect(palette).toEqual(paletteContent.colorPalette);
        expect(vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).mock.calls[0][2]).toEqual({
            workspaceId: WORKSPACE,
            filter: `id=="cp-1"`,
        });
        expect(EntitiesApi_GetAllEntitiesColorPalettes).not.toHaveBeenCalled();
    });

    it("resolves an org-scoped active color palette from the organization collection", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeColorPalette: { id: "cp-1", type: "colorPalette" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesColorPalettes).mockResolvedValue(
            listResponse([{ attributes: { content: paletteContent } }]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const palette = await styling.getColorPalette();

        expect(palette).toEqual(paletteContent.colorPalette);
        expect(vi.mocked(EntitiesApi_GetAllEntitiesColorPalettes).mock.calls[0][2]).toEqual({
            filter: `id=="cp-1"`,
        });
        expect(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).not.toHaveBeenCalled();
    });

    it("returns the default palette without org fallback when the workspace object is missing", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeColorPalette: { id: "missing", type: "workspaceColorPalette" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).mockResolvedValue(listResponse([]));

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const palette = await styling.getColorPalette();

        expect(palette).toEqual(DefaultColorPalette);
        expect(EntitiesApi_GetAllEntitiesColorPalettes).not.toHaveBeenCalled();
    });

    it("returns the default palette when the resolved content is not a valid palette", async () => {
        vi.mocked(getSettingsForCurrentUser).mockResolvedValue({
            activeColorPalette: { id: "cp-bad", type: "colorPalette" },
        } as any);
        vi.mocked(EntitiesApi_GetAllEntitiesColorPalettes).mockResolvedValue(
            listResponse([{ attributes: { content: { colorPalette: "not-an-array" } } }]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const palette = await styling.getColorPalette();

        expect(palette).toEqual(DefaultColorPalette);
    });
});

describe("TigerWorkspaceStyling workspace object management", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates a workspace theme carrying the workspaceTheme discriminator", async () => {
        vi.mocked(EntitiesApi_CreateEntityWorkspaceThemes).mockResolvedValue({
            data: {
                data: { id: "t-new", attributes: { name: "Brand", content: themeContent } },
                links: { self: "self-uri" },
            },
        } as unknown as Awaited<AxiosPromise>);

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const created = await styling.createTheme({
            type: "theme",
            title: "Brand",
            theme: themeContent,
            id: "t-new",
        } as any);

        const request = vi.mocked(EntitiesApi_CreateEntityWorkspaceThemes).mock.calls[0][2];
        expect(request.workspaceId).toBe(WORKSPACE);
        expect(request.jsonApiWorkspaceThemeInDocument.data).toEqual({
            type: "workspaceTheme",
            id: "t-new",
            attributes: { name: "Brand", content: themeContent },
        });
        expect(created).toMatchObject({ id: "t-new", type: "theme", ref: idRef("t-new") });
    });

    it("creates a workspace color palette carrying the workspaceColorPalette discriminator", async () => {
        vi.mocked(EntitiesApi_CreateEntityWorkspaceColorPalettes).mockResolvedValue({
            data: {
                data: { id: "cp-new", attributes: { name: "Brand", content: paletteContent } },
                links: { self: "self-uri" },
            },
        } as unknown as Awaited<AxiosPromise>);

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const created = await styling.createColorPalette({
            type: "colorPalette",
            title: "Brand",
            colorPalette: paletteContent.colorPalette,
            id: "cp-new",
        } as any);

        const request = vi.mocked(EntitiesApi_CreateEntityWorkspaceColorPalettes).mock.calls[0][2];
        expect(request.workspaceId).toBe(WORKSPACE);
        expect(request.jsonApiWorkspaceColorPaletteInDocument.data.type).toBe("workspaceColorPalette");
        expect(created).toMatchObject({ id: "cp-new", type: "colorPalette", ref: idRef("cp-new") });
    });

    it("lists workspace themes scoped to the workspace", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceThemes).mockResolvedValue(
            listResponse([
                { id: "t-1", attributes: { name: "Brand", content: themeContent }, links: { self: "u" } },
            ]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const themes = await styling.getThemes();

        expect(vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceThemes).mock.calls[0][2]).toMatchObject({
            workspaceId: WORKSPACE,
            origin: "NATIVE",
        });
        expect(themes).toHaveLength(1);
        expect(themes[0]).toMatchObject({ id: "t-1", type: "theme", title: "Brand" });
    });

    it("deletes a workspace theme by object id scoped to the workspace", async () => {
        vi.mocked(EntitiesApi_DeleteEntityWorkspaceThemes).mockResolvedValue(
            {} as unknown as Awaited<AxiosPromise>,
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        await styling.deleteTheme(idRef("t-del"));

        expect(vi.mocked(EntitiesApi_DeleteEntityWorkspaceThemes).mock.calls[0][2]).toEqual({
            workspaceId: WORKSPACE,
            objectId: "t-del",
        });
    });

    it("updates a workspace theme against its object id", async () => {
        vi.mocked(EntitiesApi_UpdateEntityWorkspaceThemes).mockResolvedValue({
            data: {
                data: { id: "t-1", attributes: { name: "Brand", content: themeContent } },
                links: { self: "self-uri" },
            },
        } as unknown as Awaited<AxiosPromise>);

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const updated = await styling.updateTheme({
            type: "theme",
            title: "Brand",
            theme: themeContent,
            ref: idRef("t-1"),
        } as any);

        const request = vi.mocked(EntitiesApi_UpdateEntityWorkspaceThemes).mock.calls[0][2];
        expect(request.workspaceId).toBe(WORKSPACE);
        expect(request.objectId).toBe("t-1");
        expect(request.jsonApiWorkspaceThemeInDocument.data.type).toBe("workspaceTheme");
        expect(updated).toMatchObject({ id: "t-1", type: "theme" });
    });

    it("updates a workspace color palette against its object id", async () => {
        vi.mocked(EntitiesApi_UpdateEntityWorkspaceColorPalettes).mockResolvedValue({
            data: {
                data: { id: "cp-1", attributes: { name: "Brand", content: paletteContent } },
                links: { self: "self-uri" },
            },
        } as unknown as Awaited<AxiosPromise>);

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const updated = await styling.updateColorPalette({
            type: "colorPalette",
            title: "Brand",
            colorPalette: paletteContent.colorPalette,
            ref: idRef("cp-1"),
        } as any);

        const request = vi.mocked(EntitiesApi_UpdateEntityWorkspaceColorPalettes).mock.calls[0][2];
        expect(request.workspaceId).toBe(WORKSPACE);
        expect(request.objectId).toBe("cp-1");
        expect(request.jsonApiWorkspaceColorPaletteInDocument.data.type).toBe("workspaceColorPalette");
        expect(updated).toMatchObject({ id: "cp-1", type: "colorPalette" });
    });

    it("lists workspace color palettes scoped to the workspace, filtering invalid entries", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).mockResolvedValue(
            listResponse([
                { id: "cp-1", attributes: { name: "Brand", content: paletteContent }, links: { self: "u" } },
                // invalid content (not a colorPalette array) must be filtered out
                {
                    id: "cp-2",
                    attributes: { name: "Broken", content: { colorPalette: "nope" } },
                    links: { self: "u" },
                },
            ]),
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const palettes = await styling.getColorPalettes();

        expect(vi.mocked(EntitiesApi_GetAllEntitiesWorkspaceColorPalettes).mock.calls[0][2]).toMatchObject({
            workspaceId: WORKSPACE,
            origin: "NATIVE",
        });
        expect(palettes).toHaveLength(1);
        expect(palettes[0]).toMatchObject({ id: "cp-1", type: "colorPalette", title: "Brand" });
    });

    it("deletes a workspace color palette by object id scoped to the workspace", async () => {
        vi.mocked(EntitiesApi_DeleteEntityWorkspaceColorPalettes).mockResolvedValue(
            {} as unknown as Awaited<AxiosPromise>,
        );

        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        await styling.deleteColorPalette(idRef("cp-del"));

        expect(vi.mocked(EntitiesApi_DeleteEntityWorkspaceColorPalettes).mock.calls[0][2]).toEqual({
            workspaceId: WORKSPACE,
            objectId: "cp-del",
        });
    });

    it("rejects creating a color palette with invalid content", async () => {
        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);

        await expect(
            styling.createColorPalette({ type: "colorPalette", title: "Bad", colorPalette: "nope" } as any),
        ).rejects.toThrow("Invalid color palette format");
        expect(EntitiesApi_CreateEntityWorkspaceColorPalettes).not.toHaveBeenCalled();
    });
});

describe("TigerWorkspaceStyling scope-aware activation", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("forwards a workspace-scoped theme reference to the settings service", async () => {
        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const ref = idRef("t-ws", "workspaceTheme");
        await styling.setActiveTheme(ref);

        expect(settingsServiceMock.setTheme).toHaveBeenCalledWith(ref);
    });

    it("forwards an organization-scoped theme reference to the settings service", async () => {
        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const ref = idRef("t-org", "theme");
        await styling.setActiveTheme(ref);

        expect(settingsServiceMock.setTheme).toHaveBeenCalledWith(ref);
    });

    it("forwards a workspace-scoped color palette reference to the settings service", async () => {
        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const ref = idRef("cp-ws", "workspaceColorPalette");
        await styling.setActiveColorPalette(ref);

        expect(settingsServiceMock.setColorPalette).toHaveBeenCalledWith(ref);
    });

    it("forwards an organization-scoped color palette reference to the settings service", async () => {
        const styling = new TigerWorkspaceStyling(authCall, WORKSPACE);
        const ref = idRef("cp-org", "colorPalette");
        await styling.setActiveColorPalette(ref);

        expect(settingsServiceMock.setColorPalette).toHaveBeenCalledWith(ref);
    });
});
