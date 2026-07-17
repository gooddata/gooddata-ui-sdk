// (C) 2026 GoodData Corporation

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { TigerWorkspaceSettings } from "../../workspace/settings/index.js";

describe("TigerWorkspaceSettings active styling scope", () => {
    const authCall = vi.fn() as unknown as TigerAuthenticatedCallGuard;
    let setSettingSpy: MockInstance;

    beforeEach(() => {
        setSettingSpy = vi
            .spyOn(TigerWorkspaceSettings.prototype as any, "setSetting")
            .mockResolvedValue(undefined);
    });

    afterEach(() => {
        setSettingSpy.mockRestore();
    });

    it("writes the workspaceTheme discriminator for a workspace-typed theme reference", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setTheme(idRef("t-1", "workspaceTheme"));

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_THEME", { id: "t-1", type: "workspaceTheme" });
    });

    it("writes the theme discriminator for an organization-typed theme reference", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setTheme(idRef("t-1", "theme"));

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_THEME", { id: "t-1", type: "theme" });
    });

    it("treats an untyped theme reference as organization-scoped", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setTheme(idRef("t-1"));

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_THEME", { id: "t-1", type: "theme" });
    });

    it("treats a bare id string as organization-scoped (legacy)", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setTheme("t-1");

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_THEME", { id: "t-1", type: "theme" });
    });

    it("writes the workspaceColorPalette discriminator for a workspace-typed palette reference", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setColorPalette(idRef("cp-1", "workspaceColorPalette"));

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_COLOR_PALETTE", {
            id: "cp-1",
            type: "workspaceColorPalette",
        });
    });

    it("writes the colorPalette discriminator for an organization-typed palette reference", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setColorPalette(idRef("cp-1", "colorPalette"));

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_COLOR_PALETTE", {
            id: "cp-1",
            type: "colorPalette",
        });
    });

    it("treats a bare id string as organization-scoped for palettes (legacy)", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");
        await settings.setColorPalette("cp-1");

        expect(setSettingSpy).toHaveBeenCalledWith("ACTIVE_COLOR_PALETTE", {
            id: "cp-1",
            type: "colorPalette",
        });
    });

    it("rejects a theme reference typed as a color palette scope", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");

        await expect(settings.setTheme(idRef("t-1", "workspaceColorPalette"))).rejects.toThrow(
            /reference type "workspaceColorPalette"/,
        );
        expect(setSettingSpy).not.toHaveBeenCalled();
    });

    it("rejects a palette reference typed as an unrelated object", async () => {
        const settings = new TigerWorkspaceSettings(authCall, "ws-1");

        await expect(settings.setColorPalette(idRef("cp-1", "insight"))).rejects.toThrow(
            /reference type "insight"/,
        );
        expect(setSettingSpy).not.toHaveBeenCalled();
    });
});
