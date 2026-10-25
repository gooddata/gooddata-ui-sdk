// (C) 2022-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAppliedSort, getSortConfig } from "../../store/chart_sort/chart_sort_selector.js";
import { buildSortConfig } from "../../tests/chart_sort.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { getBucketItemNames } from "./chart_sort_bucket_items.js";
import { ChartSort, type ChartSortProps, getCurrentSortType } from "./ChartSort.js";
import { ChartSortFragment } from "./fragments/ChartSortFragment.js";

vi.hoisted(() => {
    vi.resetModules();
});

// `ChartSort` reads everything from the store, so the tests stub `useSelector` per selector
// instead of passing props. `useDispatch` stays real and is served by the `withRedux` provider.
const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

type ChartSortState = Omit<ChartSortProps, "updateAppliedChartSort">;

const defaultState: ChartSortState = {
    currentSortType: "MIXED",
    sortConfig: buildSortConfig(),
    appliedSort: [],
    bucketItems: {
        attr1: {
            type: "attribute",
            name: "Countries",
        },
    },
};

const renderComponent = (customState: Partial<ChartSortState> = {}) => {
    const { sortConfig, appliedSort, bucketItems, currentSortType } = { ...defaultState, ...customState };

    useSelectorMock.mockImplementation((selector: unknown) => {
        switch (selector) {
            case getSortConfig:
                return sortConfig;
            case getAppliedSort:
                return appliedSort;
            case getBucketItemNames:
                return bucketItems;
            case getCurrentSortType:
                return currentSortType;
            default:
                return undefined;
        }
    });

    const WrappedComponent = withRedux(withIntl(ChartSort));
    const { container } = render(<WrappedComponent />);
    return new ChartSortFragment(container);
};

beforeEach(() => {
    useSelectorMock.mockReset();
});

describe("ChartSort", () => {
    describe("button not rendered", () => {
        it("should not render button when sort is not supported by the chart", () => {
            const component = renderComponent({ sortConfig: buildSortConfig(false) });
            expect(component.exists()).toBe(false);
        });
    });

    describe("button is disabled", () => {
        it("should render button as disabled when sort is supported by chart but not with the current bucket items", () => {
            const component = renderComponent({ sortConfig: buildSortConfig(true, true) });
            expect(component.getButton().isEnabled()).toBe(false);
        });

        it("should not render bubble when explanation why the button is disabled is not provided", () => {
            const component = renderComponent({ sortConfig: buildSortConfig(true, true) });
            expect(component.getButton().hasBubble()).toBe(false);
        });

        it("should render bubble when explanation why the button is disabled is provided", () => {
            const component = renderComponent({
                sortConfig: buildSortConfig(true, true, [], [], "explanation"),
            });
            expect(component.getButton().hasBubble()).toBe(true);
        });

        it("should open dropdown when button is clicked upon", () => {
            const component = renderComponent({ sortConfig: buildSortConfig(true, true) });
            component.getButton().click();
            expect(component.getDialog().isOpen()).toBe(false);
        });
    });

    describe("button is enabled", () => {
        it("should render button as enabled when sort is supported by the chart and the current bucket items", () => {
            const component = renderComponent();
            expect(component.getButton().isEnabled()).toBe(true);
        });

        it("should open dropdown when button is clicked upon", () => {
            const component = renderComponent();
            component.getButton().click();
            expect(component.getDialog().isOpen()).toBe(true);
        });
    });

    it("should render `N/A` text on the button if current sort type is `DISABLED`", () => {
        const component = renderComponent({ currentSortType: "DISABLED" });
        expect(component.getButton().getText()).toEqual("N/A");
    });

    it("should render `Mixed` text on the button if current sort type is `MIXED`", () => {
        const component = renderComponent({ currentSortType: "MIXED" });
        expect(component.getButton().getText()).toEqual("Mixed");
    });

    it("should render expected icon on the button when current sort type is `DATE_ASC` and no text", () => {
        const component = renderComponent({ currentSortType: "DATE_ASC" });
        expect(component.getButton().hasIcon("s-sort-icon--date-asc")).toBe(true);
        expect(component.getButton().getText()).toEqual("");
    });
});
