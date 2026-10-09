// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { wrapWithCustomWorkspaceSettings } from "./backend.js";

const customWindow = window as { customWorkspaceSettings?: Record<string, unknown> };

describe("wrapWithCustomWorkspaceSettings", () => {
    afterEach(() => {
        delete customWindow.customWorkspaceSettings;
    });

    it("returns the backend unchanged when window.customWorkspaceSettings is not set", () => {
        const backend = dummyBackend();

        expect(wrapWithCustomWorkspaceSettings(backend)).toBe(backend);
    });

    it("lets window.customWorkspaceSettings win over the workspace settings", async () => {
        customWindow.customWorkspaceSettings = { enableGenAiAgentSwitching: true, locale: "de-DE" };

        const settings = await wrapWithCustomWorkspaceSettings(dummyBackend())
            .workspace("ws")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toMatchObject({ enableGenAiAgentSwitching: true, locale: "de-DE" });
    });
});
