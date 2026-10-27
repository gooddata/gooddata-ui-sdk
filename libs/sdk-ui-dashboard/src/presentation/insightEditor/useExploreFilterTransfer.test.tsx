// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, idRef, newInsightDefinition } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import type { IAnalyticalDesignerApi } from "@gooddata/sdk-ui-analytical-designer";

import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { queryAndWaitFor } from "../../model/store/_infra/queryAndWaitFor.js";
import { selectInsightByWidgetRef } from "../../model/store/insights/insightsSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../model/store/tabs/layout/layoutSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import {
    buildInsightEditorFilterContext,
    loadInsightAvailableAttributes,
} from "./filterContext/insightFilterContext.js";
import { useExploreFilterTransfer } from "./useExploreFilterTransfer.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: vi.fn<() => unknown>(),
    useDashboardSelector: vi.fn<() => unknown>(),
}));
vi.mock("../../model/store/insights/insightsSelectors.js", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    selectInsightByWidgetRef: vi.fn<() => unknown>(),
}));
vi.mock("../../model/store/tabs/layout/layoutSelectors.js", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    selectAnalyticalWidgetByRef: vi.fn<() => unknown>(),
}));
vi.mock("../../model/store/_infra/queryAndWaitFor.js", () => ({
    queryAndWaitFor: vi.fn<() => unknown>(),
}));
vi.mock("./filterContext/insightFilterContext.js", () => ({
    buildInsightEditorFilterContext: vi.fn<() => unknown>(),
    loadInsightAvailableAttributes: vi.fn<() => unknown>(),
}));
const addWarning = vi.fn<(message: unknown) => void>();
vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useToastMessage: () => ({ addWarning }),
}));

const WIDGET_REF = idRef("widget");
const TARGET: InsightEditorTarget = { type: "widget", ref: WIDGET_REF };
const WIDGET = { type: "insight", ref: WIDGET_REF, insight: idRef("insight") };
const INSIGHT: IInsight = {
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: "insight",
        uri: "/insight",
        ref: idRef("insight", "insight"),
    },
};
const FILTERS = [{}] as unknown as ReturnType<typeof buildInsightEditorFilterContext>;
const SELECT_WIDGET = () => WIDGET;
const SELECT_INSIGHT = () => INSIGHT;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <BackendProvider backend={{} as IAnalyticalBackend}>
            <WorkspaceProvider workspace="ws">{children}</WorkspaceProvider>
        </BackendProvider>
    );
}

describe("useExploreFilterTransfer", () => {
    let setFilterContext: Mock<(...args: unknown[]) => void>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        setFilterContext = vi.fn<(...args: unknown[]) => void>();
        vi.mocked(useDashboardDispatch).mockReturnValue(vi.fn<() => void>() as never);
        vi.mocked(selectAnalyticalWidgetByRef).mockReturnValue(SELECT_WIDGET as never);
        vi.mocked(selectInsightByWidgetRef).mockReturnValue(SELECT_INSIGHT as never);
        vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) =>
            selector === SELECT_WIDGET ? WIDGET : selector === SELECT_INSIGHT ? INSIGHT : undefined,
        );
        vi.mocked(queryAndWaitFor).mockResolvedValue([]);
        vi.mocked(buildInsightEditorFilterContext).mockReturnValue(FILTERS);
    });

    function renderTransfer() {
        const apiRef = { current: { setFilterContext } as unknown as IAnalyticalDesignerApi };
        return renderHook(() => useExploreFilterTransfer(TARGET, true, apiRef), { wrapper: Wrapper }).result;
    }

    it("warns once when the attributes do not load, and transfers the filters on a later render", async () => {
        vi.mocked(loadInsightAvailableAttributes)
            .mockRejectedValueOnce(new Error("catalog down"))
            .mockRejectedValueOnce(new Error("catalog down"))
            .mockResolvedValue([]);
        const transfer = renderTransfer();

        await act(async () => transfer.current.onInsightOpened());
        await act(async () => transfer.current.onInsightRendered());

        expect(setFilterContext).not.toHaveBeenCalled();
        expect(addWarning).toHaveBeenCalledTimes(1);

        await act(async () => transfer.current.onInsightRendered());

        expect(setFilterContext).toHaveBeenCalledTimes(1);
        expect(setFilterContext).toHaveBeenCalledWith({ filters: FILTERS }, "keepFilterContext");
    });
});
