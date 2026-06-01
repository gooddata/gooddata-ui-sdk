// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IPluggableApp } from "@gooddata/sdk-pluggable-application-model";

import { loadLocalPluggableApplication, registerLocalApplicationLoaders } from "../localLoader.js";

describe("localLoader", () => {
    it("retries loading when previous attempt failed", async () => {
        const moduleId = "test-local-module-retry";
        const app = { mount: vi.fn() } as unknown as IPluggableApp;
        const loader = vi
            .fn()
            .mockRejectedValueOnce(new Error("chunk load failed"))
            .mockResolvedValueOnce({ pluggableApp: app });

        registerLocalApplicationLoaders({ [moduleId]: loader });

        await expect(loadLocalPluggableApplication(moduleId)).rejects.toThrow("chunk load failed");
        await expect(loadLocalPluggableApplication(moduleId)).resolves.toBe(app);
        expect(loader).toHaveBeenCalledTimes(2);

        registerLocalApplicationLoaders({});
    });
});
