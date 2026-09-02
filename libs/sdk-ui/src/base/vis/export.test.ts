// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IExecutionResult, type IExportConfig } from "@gooddata/sdk-backend-spi";

import { type IExtendedExportConfig } from "./Events.js";
import { createExportFunction } from "./export.js";

describe("createExportFunction", () => {
    it("sanitizes the main title and the additional execution titles the same way", async () => {
        const captured: IExportConfig[] = [];
        const result = {
            export: (config: IExportConfig) => {
                captured.push(config);
                return Promise.resolve({ uri: "", objectUrl: "" });
            },
        } as unknown as IExecutionResult;
        const layerResult = {} as IExecutionResult;

        await createExportFunction(result)({
            format: "xlsx",
            title: 'main/title:with"invalid*chars',
            additionalExecutions: [{ executionResult: layerResult, title: "layer/title:with?chars" }],
        } as IExtendedExportConfig);

        expect(captured[0].title).toBe("maintitlewithinvalidchars");
        expect(captured[0].additionalExecutions).toEqual([
            { executionResult: layerResult, title: "layertitlewithchars" },
        ]);
    });

    it("forwards conditionalFormatting to the export request when provided", async () => {
        const captured: IExportConfig[] = [];
        const result = {
            export: (config: IExportConfig) => {
                captured.push(config);
                return Promise.resolve({ uri: "", objectUrl: "" });
            },
        } as unknown as IExecutionResult;

        await createExportFunction(result)({
            format: "xlsx",
            conditionalFormatting: { enabled: true, rules: [] },
        } as IExtendedExportConfig);

        expect(captured[0].conditionalFormatting).toEqual({ enabled: true, rules: [] });
    });

    it("omits conditionalFormatting from the export request when not provided", async () => {
        const captured: IExportConfig[] = [];
        const result = {
            export: (config: IExportConfig) => {
                captured.push(config);
                return Promise.resolve({ uri: "", objectUrl: "" });
            },
        } as unknown as IExecutionResult;

        await createExportFunction(result)({ format: "xlsx" } as IExtendedExportConfig);

        expect(captured[0]).not.toHaveProperty("conditionalFormatting");
    });
});
