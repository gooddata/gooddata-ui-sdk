// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { selectIsAiBuilding, selectIsAiLoading } from "../../../../../model/store/config/configSelectors.js";
import {
    selectIsSaveAsNewButtonVisible,
    selectIsSaveAsNewEnabled,
} from "../../../../../model/store/topBar/topBarSelectors.js";

import { useSaveAsNewButtonProps } from "./DefaultSaveAsNewButton.js";

const mockUseDashboardSelector = vi.fn<(selector: unknown) => unknown>();

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn<() => void>(),
}));

function renderWithSaveAsNewEnabled(isSaveAsNewEnabled: boolean) {
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectIsSaveAsNewButtonVisible) {
            return true;
        }
        if (selector === selectIsSaveAsNewEnabled) {
            return isSaveAsNewEnabled;
        }
        if (selector === selectIsAiLoading || selector === selectIsAiBuilding) {
            return false;
        }
        return undefined;
    });

    return renderHook(() => useSaveAsNewButtonProps()).result.current;
}

describe("useSaveAsNewButtonProps", () => {
    it("enables the button when the dashboard can be saved as new", () => {
        expect(renderWithSaveAsNewEnabled(true).isEnabled).toBe(true);
    });

    it("disables the button when the dashboard cannot be saved as new", () => {
        expect(renderWithSaveAsNewEnabled(false).isEnabled).toBe(false);
    });
});
