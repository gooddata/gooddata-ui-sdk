// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { selectCatalogIsLoaded } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectCanEnterEditMode } from "../../../../../model/store/topBar/topBarSelectors.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";

import { useEditButtonProps } from "./DefaultEditButton.js";

const mockUseDashboardSelector = vi.fn<(selector: unknown) => unknown>();

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn<() => void>(),
}));

type HappyDomWindow = Window & {
    happyDOM?: { setViewport(viewport: { width: number; height: number }): void };
};

const setViewportWidth = (width: number) => {
    (window as HappyDomWindow).happyDOM?.setViewport({ width, height: 900 });
};

const wrapper = ({ children }: { children: ReactNode }) => <IntlWrapper>{children}</IntlWrapper>;

describe("useEditButtonProps", () => {
    const initialWidth = window.innerWidth;

    beforeEach(() => {
        mockUseDashboardSelector.mockImplementation((selector: unknown) => {
            if (selector === selectCanEnterEditMode || selector === selectCatalogIsLoaded) {
                return true;
            }
            if (selector === selectIsInEditMode) {
                return false;
            }
            return undefined;
        });
    });

    afterEach(() => {
        setViewportWidth(initialWidth);
    });

    it.each([
        [640, false],
        [641, true],
        [1170, true],
        [1171, true],
    ])("at a %ipx wide window, makes the edit button visible: %s", (width, expected) => {
        setViewportWidth(width);

        const { result } = renderHook(() => useEditButtonProps(), { wrapper });

        expect(result.current.isVisible).toBe(expected);
    });
});
