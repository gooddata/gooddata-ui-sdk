// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { changeParameterValues } from "../../../../model/commands/parameters.js";
import { selectSupportsCrossFiltering } from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsDisableUserFilterReset,
    selectIsDisabledCrossFiltering,
} from "../../../../model/store/config/configSelectors.js";
import {
    selectDisableDashboardCrossFiltering,
    selectDisableDashboardUserFilterReset,
} from "../../../../model/store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import {
    selectFilterContextFilters,
    selectIsWorkingFilterContextChanged,
    selectOriginalFilterContextFilters,
} from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectActiveTabParameterResetTargets } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../../../model/store/tabs/tabsSelectors.js";

import { useResetFiltersButton } from "./useResetFiltersButton.js";

const topNRef = idRef("topN", "parameter");
const NO_FILTERS: never[] = [];

const mockUseDashboardSelector = vi.fn();
const mockDispatch = vi.fn<(action: { type: string }) => void>();

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => mockDispatch,
}));

vi.mock("../../../../model/react/useDashboardEventDispatch.js", () => ({
    useDashboardEventDispatch: () => vi.fn(),
}));

vi.mock("../../../../model/react/useDashboardUserInteraction.js", () => ({
    useDashboardUserInteraction: () => ({
        filterContextStateReset: vi.fn(),
        parametersStateReset: vi.fn(),
    }),
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return { ...actual, useToastMessage: () => ({ addSuccess: vi.fn() }) };
});

describe("useResetFiltersButton", () => {
    beforeEach(() => {
        mockDispatch.mockReset();
        mockUseDashboardSelector.mockImplementation((selector: unknown) => {
            if (selector === selectActiveTabParameterResetTargets) {
                return [{ ref: topNRef, value: 10 }];
            }
            if (selector === selectOriginalFilterContextFilters || selector === selectFilterContextFilters) {
                return NO_FILTERS;
            }
            if (selector === selectActiveTabLocalIdentifier) {
                return "tab-1";
            }
            if (
                selector === selectIsInEditMode ||
                selector === selectIsWorkingFilterContextChanged ||
                selector === selectIsApplyFiltersAllAtOnceEnabledAndSet ||
                selector === selectSupportsCrossFiltering ||
                selector === selectIsDisabledCrossFiltering ||
                selector === selectDisableDashboardCrossFiltering ||
                selector === selectIsDisableUserFilterReset ||
                selector === selectDisableDashboardUserFilterReset
            ) {
                return false;
            }
            return undefined;
        });
    });

    it("dispatches the parameter reset targets as a command, without touching the filter context", () => {
        const { result } = renderHook(() => useResetFiltersButton());

        expect(result.current.canReset).toBe(true);

        act(() => {
            result.current.resetFilters();
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 10 }] }),
        );
        expect(mockDispatch.mock.calls.map(([action]) => action.type)).not.toContain(
            "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
        );
    });
});
