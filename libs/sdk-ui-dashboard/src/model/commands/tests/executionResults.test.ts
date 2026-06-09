// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionResult } from "@gooddata/sdk-backend-spi";
import { type IExecutionResultLimitBreak, idRef } from "@gooddata/sdk-model";

import {
    setExecutionResultData,
    setExecutionResultError,
    setExecutionResultLoading,
} from "../executionResults.js";

describe("executionResults commands", () => {
    const ref = idRef("widget");
    const executionResult = {} as IExecutionResult;
    const limitBreaks: IExecutionResultLimitBreak[] = [{ limitType: "rowCount", limit: 1000, value: 1500 }];

    it("should propagate limit breaks into the result data payload", () => {
        const command = setExecutionResultData(ref, executionResult, undefined, limitBreaks);

        expect(command.payload.limitBreaks).toEqual(limitBreaks);
        expect(command.payload.isLoading).toBe(false);
        expect(command.payload.error).toBeUndefined();
    });

    it("should leave limit breaks undefined when none are provided", () => {
        const command = setExecutionResultData(ref, executionResult, undefined, undefined);

        expect(command.payload.limitBreaks).toBeUndefined();
    });

    it("should clear limit breaks when loading starts", () => {
        const command = setExecutionResultLoading(ref);

        expect(command.payload.limitBreaks).toBeUndefined();
        expect(command.payload.isLoading).toBe(true);
    });

    it("should clear limit breaks on error", () => {
        const command = setExecutionResultError(ref, { message: "boom" } as never);

        expect(command.payload.limitBreaks).toBeUndefined();
        expect(command.payload.isLoading).toBe(false);
    });
});
