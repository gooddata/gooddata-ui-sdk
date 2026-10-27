// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, idRef, newInsightDefinition } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectEnableVisualizationPermissions } from "../../model/store/config/configSelectors.js";
import { selectInsights } from "../../model/store/insights/insightsSelectors.js";
import { selectCanManageWorkspace } from "../../model/store/permissions/permissionsSelectors.js";

import {
    indexInsightPermissions,
    loadInsightPermissions,
    useInsightEditPermissions,
} from "./useInsightEditPermissions.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn<() => unknown>(),
}));

const insight = (id: string, permissions?: IInsight["insight"]["permissions"]): IInsight => ({
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: id,
        uri: `/${id}`,
        ref: idRef(id, "insight"),
        ...(permissions ? { permissions } : {}),
    },
});

/** The slice of a backend the loader touches: an insights query answering with the given items. */
function fakeBackend(answer: (ids: string[]) => Promise<IInsight[]>) {
    const calls: { workspace: string; ids: string[]; method?: string }[] = [];
    const backend = {
        workspace: (workspace: string) => ({
            insights: () => ({
                getInsightsQuery: () => {
                    const call: (typeof calls)[number] = { workspace, ids: [] };
                    const query = {
                        withMethod: (method: string) => ((call.method = method), query),
                        withFilter: (filter: { id?: string[] }) => ((call.ids = filter.id ?? []), query),
                        withMetaInclude: () => query,
                        query: async () => {
                            calls.push(call);
                            const items = await answer(call.ids);
                            return { items, totalCount: items.length, all: async () => items };
                        },
                    };
                    return query;
                },
            }),
        }),
    };
    // a partial backend; the loader reaches nothing beyond the insights query
    return { backend: backend as unknown as IAnalyticalBackend, calls };
}

function selectorValues(values: { enabled: boolean; canManage: boolean; insights: IInsight[] | undefined }) {
    vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) => {
        if (selector === selectEnableVisualizationPermissions) return values.enabled;
        if (selector === selectCanManageWorkspace) return values.canManage;
        if (selector === selectInsights) return values.insights;
        throw new Error("unexpected selector");
    });
}

function wrapperFor(backend: IAnalyticalBackend, workspace: string) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={workspace}>{children}</WorkspaceProvider>
            </BackendProvider>
        );
    }
    return Wrapper;
}

describe("indexInsightPermissions", () => {
    it("keys each visualization's permissions by its id, empty when none came back", () => {
        expect(indexInsightPermissions([insight("a", ["EDIT"]), insight("b")])).toEqual({
            a: ["EDIT"],
            b: [],
        });
    });
});

describe("loadInsightPermissions", () => {
    it("asks for the ids in a POST body and reads every page", async () => {
        const { backend, calls } = fakeBackend(async (ids) => ids.map((id) => insight(id, ["VIEW"])));

        const loaded = await loadInsightPermissions(backend, "ws", ["a", "b"]);

        expect(calls).toEqual([{ workspace: "ws", ids: ["a", "b"], method: "POST" }]);
        expect(loaded).toEqual({ a: ["VIEW"], b: ["VIEW"] });
    });
});

describe("useInsightEditPermissions", () => {
    const insights = [insight("a"), insight("b")];

    beforeEach(() => {
        vi.mocked(useDashboardSelector).mockReset();
    });

    it("gives nothing and makes no request when the role decides", () => {
        const { backend, calls } = fakeBackend(async () => []);
        selectorValues({ enabled: true, canManage: true, insights });

        const { result } = renderHook(() => useInsightEditPermissions(), {
            wrapper: wrapperFor(backend, "ws"),
        });

        expect(result.current).toBeUndefined();
        expect(calls).toHaveLength(0);
    });

    it("loads the permissions of the dashboard's visualizations for everyone else", async () => {
        const { backend } = fakeBackend(async (ids) =>
            ids.map((id) => insight(id, id === "a" ? ["EDIT"] : [])),
        );
        selectorValues({ enabled: true, canManage: false, insights });

        const { result } = renderHook(() => useInsightEditPermissions(), {
            wrapper: wrapperFor(backend, "ws"),
        });

        expect(result.current).toBeUndefined();
        await waitFor(() => expect(result.current).toEqual({ a: ["EDIT"], b: [] }));
    });

    it("reads again for another workspace and drops the previous map meanwhile", async () => {
        const { backend, calls } = fakeBackend(async (ids) => ids.map((id) => insight(id, ["EDIT"])));
        selectorValues({ enabled: true, canManage: false, insights });
        let workspace = "ws1";
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={workspace}>{children}</WorkspaceProvider>
                </BackendProvider>
            );
        }

        const { result, rerender } = renderHook(() => useInsightEditPermissions(), { wrapper: Wrapper });
        await waitFor(() => expect(result.current).toBeDefined());

        workspace = "ws2";
        rerender();

        expect(result.current).toBeUndefined();
        await waitFor(() => expect(result.current).toBeDefined());
        expect(calls.map((call) => call.workspace)).toEqual(["ws1", "ws2"]);
    });

    it("reads again when the dashboard's visualizations change", async () => {
        const { backend, calls } = fakeBackend(async (ids) => ids.map((id) => insight(id, ["EDIT"])));
        selectorValues({ enabled: true, canManage: false, insights });

        const { result, rerender } = renderHook(() => useInsightEditPermissions(), {
            wrapper: wrapperFor(backend, "ws"),
        });
        await waitFor(() => expect(result.current).toBeDefined());

        selectorValues({ enabled: true, canManage: false, insights: [...insights, insight("c")] });
        rerender();

        await waitFor(() => expect(calls).toHaveLength(2));
        expect(calls[1].ids).toEqual(["a", "b", "c"]);
        await waitFor(() => expect(result.current).toHaveProperty("c"));
    });

    it("gives nothing after a failed read, not an empty map", async () => {
        const { backend, calls } = fakeBackend(async () => {
            throw new Error("403");
        });
        selectorValues({ enabled: true, canManage: false, insights });

        const { result } = renderHook(() => useInsightEditPermissions(), {
            wrapper: wrapperFor(backend, "ws"),
        });

        await waitFor(() => expect(calls).toHaveLength(1));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(result.current).toBeUndefined();
    });
});
