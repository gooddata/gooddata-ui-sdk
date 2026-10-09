// (C) 2026 GoodData Corporation

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsight } from "@gooddata/sdk-model";

import type { IChatConversationMultipartLocalPart } from "../../../model.js";

import { useInsightSaveCheck } from "./useSaveCheck.js";

const query = vi.fn();
const withFilter = vi.fn();
const getInsight = vi.fn();

const backend = {
    workspace: () => ({
        insights: () => ({
            getInsight,
            getInsightsQuery: () => {
                const insightsQuery = {
                    withFilter: (filter: unknown) => {
                        withFilter(filter);
                        return insightsQuery;
                    },
                    query,
                };
                return insightsQuery;
            },
        }),
    }),
};

vi.mock("@gooddata/sdk-ui", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useBackendStrict: () => backend,
    useWorkspaceStrict: () => "workspace",
}));

const visualization = { insight: { identifier: "revenue_by_product_ce8a580d" } } as IInsight;

function part(saving?: IChatConversationMultipartLocalPart["saving"]) {
    return { type: "visualization", saving } as unknown as IChatConversationMultipartLocalPart;
}

describe("useSaveCheck", () => {
    beforeEach(() => {
        query.mockReset();
        withFilter.mockReset();
        getInsight.mockReset();
        getInsight.mockRejectedValue(new Error("404 Not Found"));
    });

    it("reports an unsaved chart without requesting it by id", async () => {
        query.mockResolvedValue({ items: [] });

        const { result } = renderHook(() => useInsightSaveCheck(part(), visualization, true));

        await waitFor(() => expect(result.current.visualisationCheckLoading).toBe(false));
        expect(result.current.visualisationSaved).toBe(false);
        expect(withFilter).toHaveBeenCalledWith({ id: ["revenue_by_product_ce8a580d"] });
        expect(getInsight).not.toHaveBeenCalled();
    });

    it("reports a saved chart when the query returns it", async () => {
        query.mockResolvedValue({ items: [visualization] });

        const { result } = renderHook(() => useInsightSaveCheck(part(), visualization, true));

        await waitFor(() => expect(result.current.visualisationSaved).toBe(true));
    });

    it("reports not saved when the query fails", async () => {
        query.mockRejectedValue(new Error("500"));

        const { result } = renderHook(() => useInsightSaveCheck(part(), visualization, true));

        await waitFor(() => expect(result.current.visualisationCheckLoading).toBe(false));
        expect(result.current.visualisationSaved).toBe(false);
    });

    it("does not check while a save is in progress", async () => {
        const { result } = renderHook(() =>
            useInsightSaveCheck(part({ started: true, completed: false }), visualization, true),
        );

        await waitFor(() => expect(result.current.visualisationCheckLoading).toBe(false));
        expect(result.current.visualisationSaved).toBe(false);
        expect(query).not.toHaveBeenCalled();
        expect(getInsight).not.toHaveBeenCalled();
    });

    it("does not check when disabled or without a visualization", async () => {
        const disabled = renderHook(() => useInsightSaveCheck(part(), visualization, false));
        const missing = renderHook(() => useInsightSaveCheck(part(), undefined, true));

        await waitFor(() => expect(disabled.result.current.visualisationCheckLoading).toBe(false));
        await waitFor(() => expect(missing.result.current.visualisationCheckLoading).toBe(false));
        expect(query).not.toHaveBeenCalled();
        expect(getInsight).not.toHaveBeenCalled();
    });
});
