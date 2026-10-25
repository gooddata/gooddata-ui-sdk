// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { removeMetadata } from "@gooddata/util";

import { CatalogUiActions } from "../../../sagas/catalog/catalog_ui_actions.js";
import { enableUnavailableItemsVisibility } from "../../../selectors/feature_flag_selector.js";
import {
    isLoadingAvailability,
    isLoadingGroups,
    isLoadingItems,
    showUnavailableItems,
} from "../../../store/catalog/catalog_selector.js";
import rawTranslations from "../../../translations/en-US.json" with { type: "json" };

import { AvailableItemsStatusPure, type IAvailableItemsStatusProps } from "./AvailableItemsStatus.js";

const translations = removeMetadata(rawTranslations);

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

interface IMockedState {
    isUpdateInProgress: boolean;
    isLoadingGroups: boolean;
    isLoadingItems: boolean;
    showUnavailableItems: boolean;
    enableUnavailableItemsVisibility: boolean;
}

const defaultState: IMockedState = {
    isUpdateInProgress: false,
    isLoadingGroups: false,
    isLoadingItems: false,
    showUnavailableItems: false,
    enableUnavailableItemsVisibility: false,
};

beforeEach(() => {
    useSelectorMock.mockReset();
    dispatchMock.mockReset();
});

describe("AvailableItemsStatus", () => {
    function renderComponent({
        hiddenItemsCount = 0,
        ...stateOverrides
    }: Partial<IMockedState> & Partial<IAvailableItemsStatusProps>) {
        const state: IMockedState = { ...defaultState, ...stateOverrides };

        useSelectorMock.mockImplementation((selector: unknown) => {
            if (selector === isLoadingAvailability) {
                return state.isUpdateInProgress;
            }
            if (selector === isLoadingGroups) {
                return state.isLoadingGroups;
            }
            if (selector === isLoadingItems) {
                return state.isLoadingItems;
            }
            if (selector === showUnavailableItems) {
                return state.showUnavailableItems;
            }
            if (selector === enableUnavailableItemsVisibility) {
                return state.enableUnavailableItemsVisibility;
            }
            return undefined;
        });

        return render(
            <IntlProvider locale="en-US" messages={translations}>
                <AvailableItemsStatusPure hiddenItemsCount={hiddenItemsCount} />
            </IntlProvider>,
        );
    }

    it("should not render any panel when loading is not in progress and no items are hidden", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 0,
            isUpdateInProgress: false,
        });

        const unavailableItemsPanel = container.querySelectorAll(".s-unavailable-items-matched");
        const loadingPanel = container.querySelectorAll(".s-availability-spinner");

        expect(unavailableItemsPanel).toHaveLength(0);
        expect(loadingPanel).toHaveLength(0);
    });

    it("should render loading panel when loading is in progress and no items are hidden", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 0,
            isUpdateInProgress: true,
        });

        const unavailableItemsPanel = container.querySelectorAll(".s-unavailable-items-matched");
        const loadingPanel = container.querySelectorAll(".s-availability-spinner");

        expect(unavailableItemsPanel).toHaveLength(0);
        expect(loadingPanel).toHaveLength(1);
    });

    it("should render loading panel when loading is in progress and some items are hidden", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 10,
            isUpdateInProgress: true,
        });

        const unavailableItemsPanel = container.querySelectorAll(".s-unavailable-items-matched");
        const loadingPanel = container.querySelectorAll(".s-availability-spinner");

        expect(unavailableItemsPanel).toHaveLength(0);
        expect(loadingPanel).toHaveLength(1);
    });

    it("should render availability info panel when loading is not in progress and some items are hidden", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 10,
            isUpdateInProgress: false,
        });

        const unavailableItemsPanel = container.querySelectorAll(".s-unavailable-items-matched");
        const loadingPanel = container.querySelectorAll(".s-availability-spinner");

        expect(unavailableItemsPanel).toHaveLength(1);
        expect(loadingPanel).toHaveLength(0);
    });

    it("should render the show unavailable items button", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 10,
            isUpdateInProgress: false,
            enableUnavailableItemsVisibility: true,
        });

        const showButton = container.querySelectorAll(".gd-button-link-dimmed");
        const showButtonText = container.querySelector(".gd-button-text").innerHTML;

        expect(showButton).toHaveLength(1);
        expect(showButtonText).toBe("Show");
    });

    it("should render the hide unavailable items button", () => {
        const { container } = renderComponent({
            isLoadingGroups: false,
            isLoadingItems: false,
            hiddenItemsCount: 10,
            isUpdateInProgress: false,
            enableUnavailableItemsVisibility: true,
            showUnavailableItems: true,
        });

        const hideButton = container.querySelectorAll(".gd-button-link-dimmed");
        const hideButtonText = container.querySelector(".gd-button-text").innerHTML;

        expect(hideButton).toHaveLength(1);
        expect(hideButtonText).toBe("Hide");
    });

    it("should dispatch the unavailable items visibility toggle on button click", async () => {
        const { container } = renderComponent({
            hiddenItemsCount: 10,
            enableUnavailableItemsVisibility: true,
        });

        await userEvent.click(container.querySelector(".gd-button-link-dimmed"));

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(CatalogUiActions.toggleUnavailableItemsVisibility(true));
    });
});
