// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ScreenSize } from "@gooddata/sdk-model";

import { setScreenSize } from "../../../model/commands/layout.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectScreen } from "../../../model/store/tabs/layout/layoutSelectors.js";

import { DashboardScreenSizeProvider, useScreenSize } from "./DashboardScreenSizeContext.js";

const mockUseDashboardSelector = vi.fn<(selector: unknown) => unknown>();
const mockDispatch = vi.fn<(action: unknown) => void>();

// vitest runs with isolate: false; reset the module registry so the mocks below apply.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => mockDispatch,
}));

type HappyDomWindow = Window & {
    happyDOM?: { setViewport(viewport: { width: number; height: number }): void };
};

const setViewportWidth = (width: number) => {
    (window as HappyDomWindow).happyDOM?.setViewport({ width, height: 900 });
};

function ScreenSizeProbe() {
    return <div data-testid="screen">{useScreenSize()}</div>;
}

function renderProvider(isEditMode: boolean) {
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectScreen) {
            return "xl";
        }
        if (selector === selectIsInEditMode) {
            return isEditMode;
        }
        return undefined;
    });
    return render(
        <DashboardScreenSizeProvider>
            <ScreenSizeProbe />
        </DashboardScreenSizeProvider>,
    );
}

describe("DashboardScreenSizeProvider", () => {
    const initialWidth = window.innerWidth;

    beforeEach(() => {
        mockDispatch.mockReset();
    });

    afterEach(() => {
        setViewportWidth(initialWidth);
    });

    it.each<[number, boolean, ScreenSize]>([
        [1000, false, "md"],
        [1000, true, "lg"],
        [700, true, "lg"],
        [1400, true, "lg"],
        [1600, true, "xl"],
    ])("at a %ipx wide window with edit mode %s, uses the %s screen", (width, isEditMode, expected) => {
        setViewportWidth(width);

        renderProvider(isEditMode);

        expect(screen.getByTestId("screen")).toHaveTextContent(expected);
        expect(mockDispatch).toHaveBeenCalledWith(setScreenSize(expected));
    });
});
