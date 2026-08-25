// (C) 2026 GoodData Corporation

// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";

import { type DashboardContext } from "../../../types/commonTypes.js";

import { loadAutomationTimezone } from "./loadAutomationTimezone.js";

function createContext(
    automationId: string | undefined,
    automations: { getAutomation: (id: string) => Promise<IAutomationMetadataObject> } | Error,
): DashboardContext {
    return {
        workspace: "ws",
        config: automationId ? { focusObject: { automationId } } : {},
        backend: {
            workspace: () => ({
                automations: () => {
                    if (automations instanceof Error) {
                        throw automations;
                    }
                    return automations;
                },
            }),
        },
    } as unknown as DashboardContext;
}

const alertWithTimezone = {
    alert: { execution: { executionConfig: { timezone: "Europe/Prague" } } },
} as IAutomationMetadataObject;

describe("loadAutomationTimezone", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the timezone of the deep-linked automation", async () => {
        const getAutomation = vi.fn().mockResolvedValue(alertWithTimezone);

        await expect(loadAutomationTimezone(createContext("a-1", { getAutomation }))).resolves.toBe(
            "Europe/Prague",
        );
        expect(getAutomation).toHaveBeenCalledWith("a-1");
    });

    it("does not load anything when the dashboard is not deep-linked to an automation", async () => {
        const getAutomation = vi.fn().mockResolvedValue(alertWithTimezone);

        await expect(
            loadAutomationTimezone(createContext(undefined, { getAutomation })),
        ).resolves.toBeUndefined();
        expect(getAutomation).not.toHaveBeenCalled();
    });

    it("resolves to undefined when the automation cannot be loaded", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const getAutomation = vi.fn().mockRejectedValue(new Error("404"));

        await expect(
            loadAutomationTimezone(createContext("a-1", { getAutomation })),
        ).resolves.toBeUndefined();
    });

    it("resolves to undefined when the backend has no automations service", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        await expect(
            loadAutomationTimezone(createContext("a-1", new Error("not supported"))),
        ).resolves.toBeUndefined();
    });
});
