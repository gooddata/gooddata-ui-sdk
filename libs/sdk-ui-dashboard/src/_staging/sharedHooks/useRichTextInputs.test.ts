// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IFilter, type IRichTextWidget, idRef, newPositiveAttributeFilter } from "@gooddata/sdk-model";

const mockWidgetFilters = vi.fn();
const mockParametersLoading = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => undefined,
}));

vi.mock("../../model/react/useTextParameters.js", () => ({
    useTextParameters: () => ({
        execConfig: {},
        parameterDisplayValues: undefined,
        loading: mockParametersLoading(),
    }),
}));

vi.mock("./useRichTextFilters.js", () => ({
    useRichTextWidgetFilters: () => mockWidgetFilters(),
    useSectionDescriptionFilters: () => [],
}));

const { useRichTextInputs, useRichTextWidgetInputs } = await import("./useRichTextInputs.js");

const regionFilter: IFilter = newPositiveAttributeFilter(idRef("region"), ["East"]);
const widget = { type: "richText", ref: idRef("w-1") } as IRichTextWidget;

beforeEach(() => {
    mockParametersLoading.mockReturnValue(false);
});

describe("useRichTextInputs", () => {
    it("waits while the filters from the parent load", () => {
        const { result } = renderHook(() => useRichTextInputs("{metric/revenue}", undefined));

        expect(result.current.isExecutionInputLoading).toBe(true);
    });

    it("executes when the filters and the parameters are loaded", () => {
        const { result } = renderHook(() => useRichTextInputs("{metric/revenue}", [regionFilter]));

        expect(result.current.isExecutionInputLoading).toBe(false);
    });

    it("waits while the parameters load", () => {
        mockParametersLoading.mockReturnValue(true);

        const { result } = renderHook(() => useRichTextInputs("{metric/revenue}", [regionFilter]));

        expect(result.current.isExecutionInputLoading).toBe(true);
    });
});

describe("useRichTextWidgetInputs", () => {
    it("waits while the widget filters load", () => {
        mockWidgetFilters.mockReturnValue(undefined);

        const { result } = renderHook(() => useRichTextWidgetInputs(widget, "{metric/revenue}"));

        expect(result.current.isExecutionInputLoading).toBe(true);
    });

    it("passes the widget filters on when they are loaded", () => {
        mockWidgetFilters.mockReturnValue([regionFilter]);

        const { result } = renderHook(() => useRichTextWidgetInputs(widget, "{metric/revenue}"));

        expect(result.current).toMatchObject({ filters: [regionFilter], isExecutionInputLoading: false });
    });
});
