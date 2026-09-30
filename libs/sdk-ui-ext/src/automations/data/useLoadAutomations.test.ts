// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAutomationsQueryResult } from "@gooddata/sdk-backend-spi";

import { AutomationsDefaultState } from "../constants.js";
import { type IAutomationService, type IUseLoadAutomationsProps } from "../types.js";

import { useLoadAutomations } from "./useLoadAutomations.js";

const { promiseGetAutomationsQuery } = vi.hoisted(() => ({
    promiseGetAutomationsQuery: vi.fn<IAutomationService["promiseGetAutomationsQuery"]>(),
}));

vi.mock("../useAutomationService.js", () => ({
    useAutomationService: () => ({ promiseGetAutomationsQuery }),
}));

const noFilter = { value: "" };

const props = (overrides: Partial<IUseLoadAutomationsProps>): IUseLoadAutomationsProps => ({
    type: "schedule",
    pageSize: 20,
    state: AutomationsDefaultState,
    dashboardFilterQuery: noFilter,
    recipientsFilterQuery: noFilter,
    externalRecipientsFilterQuery: noFilter,
    workspacesFilterQuery: noFilter,
    statusFilterQuery: noFilter,
    createdByFilterQuery: noFilter,
    includeAutomationResult: false,
    includeUnavailableReferences: false,
    isReady: true,
    scope: "workspace",
    setState: vi.fn<IUseLoadAutomationsProps["setState"]>(),
    ...overrides,
});

describe("useLoadAutomations", () => {
    beforeEach(() => {
        promiseGetAutomationsQuery.mockReset();
        promiseGetAutomationsQuery.mockResolvedValue({
            items: [],
            totalCount: 0,
        } as unknown as IAutomationsQueryResult);
    });

    it("reports loading and does not load until ready", () => {
        const { result } = renderHook(() => useLoadAutomations(props({ isReady: false })));

        expect(result.current.status).toBe("loading");
        expect(promiseGetAutomationsQuery).not.toHaveBeenCalled();
    });

    it("loads once ready, asking for unavailable references when enabled", async () => {
        const { rerender } = renderHook(
            (hookProps: IUseLoadAutomationsProps) => useLoadAutomations(hookProps),
            {
                initialProps: props({ isReady: false, includeUnavailableReferences: true }),
            },
        );

        rerender(props({ isReady: true, includeUnavailableReferences: true }));

        await waitFor(() => expect(promiseGetAutomationsQuery).toHaveBeenCalledTimes(1));
        expect(promiseGetAutomationsQuery).toHaveBeenCalledWith(
            expect.objectContaining({ includeUnavailableReferences: true }),
        );
    });

    it("does not ask for unavailable references when disabled", async () => {
        renderHook(() => useLoadAutomations(props({ includeUnavailableReferences: false })));

        await waitFor(() => expect(promiseGetAutomationsQuery).toHaveBeenCalledTimes(1));
        expect(promiseGetAutomationsQuery).toHaveBeenCalledWith(
            expect.objectContaining({ includeUnavailableReferences: false }),
        );
    });
});
