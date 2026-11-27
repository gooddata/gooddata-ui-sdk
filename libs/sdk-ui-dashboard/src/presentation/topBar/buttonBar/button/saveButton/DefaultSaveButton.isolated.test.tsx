// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { messages } from "../../../../../locales.js";
import {
    selectIsAiBuilding,
    selectIsAiLoading,
    selectIsAiMode,
} from "../../../../../model/store/config/configSelectors.js";
import { selectIsDashboardDirty } from "../../../../../model/store/meta/metaSelectors.js";
import { selectIsInEditMode } from "../../../../../model/store/renderMode/renderModeSelectors.js";
import { selectIsDashboardSaving } from "../../../../../model/store/saving/savingSelectors.js";
import { selectLayoutHasAnalyticalWidgets } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import {
    selectCanSaveDashboard,
    selectIsPrivateDashboard,
} from "../../../../../model/store/topBar/topBarSelectors.js";
import { type DashboardState } from "../../../../../model/store/types.js";
import { type DashboardConfig } from "../../../../../model/types/commonTypes.js";

import { useSaveButtonProps } from "./DefaultSaveButton.js";

const mockUseDashboardSelector = vi.fn<(selector: unknown) => unknown>();

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn<() => void>(),
}));

function renderWithSaveButtonState({
    aiMode,
    isDashboardDirty = false,
    canSaveDashboard = false,
    hasAnalyticalWidgets = true,
}: {
    aiMode?: DashboardConfig["aiMode"];
    isDashboardDirty?: boolean;
    canSaveDashboard?: boolean;
    hasAnalyticalWidgets?: boolean;
} = {}) {
    const state = { config: { config: { aiMode } } } as DashboardState;
    const selectorValues = new Map<unknown, boolean>([
        [selectIsInEditMode, true],
        [selectIsAiLoading, selectIsAiLoading(state)],
        [selectIsAiBuilding, selectIsAiBuilding(state)],
        [selectIsAiMode, selectIsAiMode(state)],
        [selectIsDashboardSaving, false],
        [selectIsPrivateDashboard, false],
        [selectLayoutHasAnalyticalWidgets, hasAnalyticalWidgets],
        [selectCanSaveDashboard, canSaveDashboard],
        [selectIsDashboardDirty, isDashboardDirty],
    ]);
    mockUseDashboardSelector.mockImplementation((selector) => selectorValues.get(selector));

    return renderHook(() => useSaveButtonProps()).result.current;
}

describe("useSaveButtonProps", () => {
    it("enables saving an active AI dashboard even when it is neither dirty nor saveable by the regular selectors", () => {
        const props = renderWithSaveButtonState({ aiMode: "active" });

        expect(props.isEnabled).toBe(true);
        expect(props.buttonTitle).toBe(messages.controlButtonsSaveAndPublishTitle);
    });

    it("keeps a non-AI dashboard without changes disabled", () => {
        const props = renderWithSaveButtonState();

        expect(props.isEnabled).toBe(false);
        expect(props.buttonTitle).toBe(messages.controlButtonsSaveAndPublishNoChanges);
    });

    it.each([
        [false, true, false],
        [true, false, false],
        [true, true, true],
    ])(
        "keeps non-AI enablement for dirty=%s and canSave=%s at %s",
        (isDashboardDirty, canSaveDashboard, expected) => {
            expect(renderWithSaveButtonState({ isDashboardDirty, canSaveDashboard }).isEnabled).toBe(
                expected,
            );
        },
    );

    describe.each([false, true])("with regular save eligibility=%s", (canSave) => {
        it.each(["generating", "waiting", "building"] as const)(
            "disables saving while AI is %s",
            (aiMode) => {
                const props = renderWithSaveButtonState({
                    aiMode,
                    isDashboardDirty: canSave,
                    canSaveDashboard: canSave,
                });

                expect(props.isEnabled).toBe(false);
            },
        );
    });

    it.each([undefined, "active"] as const)(
        "disables saving a dashboard without analytical widgets in %s mode",
        (aiMode) => {
            const props = renderWithSaveButtonState({
                aiMode,
                isDashboardDirty: true,
                canSaveDashboard: true,
                hasAnalyticalWidgets: false,
            });

            expect(props.isEnabled).toBe(false);
            expect(props.buttonTitle).toBe(messages.controlButtonsSaveAndPublishEmpty);
        },
    );
});
