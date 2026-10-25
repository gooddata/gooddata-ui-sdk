// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { idRef, uriRef } from "@gooddata/sdk-model";
import { type IAttributeDropdownItem, type IMeasureDropdownItem } from "@gooddata/sdk-ui-filters";

import {
    enableImprovedRankingFilter,
    enableRankingStrictLimit,
    enableRankingWithMvf,
} from "../../../selectors/feature_flag_selector.js";
import { updateRankingFilter } from "../../../store/bucket_filters/bucket_filters_actions.js";
import { hasActiveMeasureValueFilter } from "../../../store/filter_bar/filter_bar_selector.js";
import { getAboutToBeRemovedBucketAndFilterItems } from "../../../store/highlighting/highlighting_selector.js";
import { type IAppState } from "../../../store/types.js";
import { withIntl } from "../../../utils/with_intl.js";

import {
    attributeItems,
    measureItems,
    rankingFilterState,
    rankingFilterStateWithAttributeLocalIdentifiers,
    rankingFilterStateWithCatalogAttribute,
    rankingFilterStateWithCatalogMeasureRef,
    rankingFilterWithAttributes,
    rankingFilterWithUriAttribute,
    rankingFilterWithUriMeasure,
    rankingFilterWithoutAttributes,
} from "./RankingFilter.test.helpers.js";
import {
    type IRankingFilterItemProps,
    RankingFilterItem,
    createRankingFilterItem,
    createRankingFilterModel,
    getMeasuresSelector,
    getMultipleDatesAttributeSelector,
} from "./RankingFilterItem.js";

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

/**
 * The redux-sourced values the component reads. Each key maps to one of the selectors it passes to
 * `useSelector`, so a test can drive the component by naming the derived value it cares about.
 */
interface ISelectedState {
    measureItems?: IMeasureDropdownItem[];
    attributeItems?: IAttributeDropdownItem[];
    aboutToBeRemovedBucketAndFilterItems?: string[];
    hasActiveMeasureValueFilter?: boolean;
    enableRankingWithMvf?: boolean;
    enableRankingStrictLimit?: boolean;
    enableImprovedRankingFilter?: boolean;
}

const DROPDOWN_BUTTON = ".s-filter-button";
const DROPDOWN_BODY = ".s-rf-dropdown-body";

const renderComponent = (props?: Partial<IRankingFilterItemProps>, state: ISelectedState = {}) => {
    const selected = new Map<unknown, unknown>([
        [getMeasuresSelector, state.measureItems ?? measureItems],
        [getMultipleDatesAttributeSelector, state.attributeItems ?? attributeItems],
        [getAboutToBeRemovedBucketAndFilterItems, state.aboutToBeRemovedBucketAndFilterItems ?? null],
        [hasActiveMeasureValueFilter, state.hasActiveMeasureValueFilter ?? false],
        [enableRankingWithMvf, state.enableRankingWithMvf ?? false],
        [enableRankingStrictLimit, state.enableRankingStrictLimit ?? false],
        [enableImprovedRankingFilter, state.enableImprovedRankingFilter ?? false],
    ]);

    useSelectorMock.mockImplementation((selector: (state: IAppState) => unknown) =>
        selected.has(selector)
            ? selected.get(selector)
            : // The remaining reads are the component's inline catalog "out of" selectors. With
              // enableImprovedRankingFilter off they short-circuit to their stable empty defaults
              // without ever touching the state, so an empty stub is enough here.
              selector({} as IAppState),
    );

    const Wrapped = withIntl(RankingFilterItem);

    return render(<Wrapped filter={rankingFilterState} {...props} />);
};

describe("RankingFilterItem", () => {
    beforeEach(() => {
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    describe("filter item button", () => {
        it("should render provided class", () => {
            const propagatedClassName = "s-test-filter";
            const { container } = renderComponent({
                className: propagatedClassName,
            });

            expect(container.querySelector(`.${propagatedClassName}`)).toBeTruthy();
        });

        it("should not have `is-active` class when filter is closed", () => {
            const { container } = renderComponent();

            expect(container.querySelector(".is-active")).toBeFalsy();
        });

        it("should have `is-active` class when filter is opened", () => {
            const { container } = renderComponent();
            fireEvent.click(container.querySelector(DROPDOWN_BUTTON));
            expect(container.querySelector(".is-active")).toBeTruthy();
        });

        it("should not be highlighted by default", () => {
            const { container } = renderComponent();

            expect(container.querySelector(".highlight")).toBeFalsy();
        });

        it("should be highlighted when highlight property is set", () => {
            const { container } = renderComponent({
                isHighlighted: true,
            });

            expect(container.querySelector(".highlight")).toBeTruthy();
        });

        it("should not be highlighted if no item is about to be removed", () => {
            const { container } = renderComponent();

            expect(container.querySelector(".about-to-be-removed")).toBeFalsy();
        });

        it("should not be highlighted if some other items are about to be removed", () => {
            const { container } = renderComponent({}, { aboutToBeRemovedBucketAndFilterItems: ["f2"] });

            expect(container.querySelector(".about-to-be-removed")).toBeFalsy();
        });

        it("should be highlighted if filter is about to be removed", () => {
            const { container } = renderComponent({}, { aboutToBeRemovedBucketAndFilterItems: ["f1"] });

            expect(container.querySelector(".about-to-be-removed")).toBeTruthy();
        });
    });

    describe("filter configuration", () => {
        it("should render dropdown closed", () => {
            renderComponent();

            expect(document.querySelector(DROPDOWN_BODY)).toBeFalsy();
        });

        it("should mount with the dropdown opened when the filter was just added", () => {
            renderComponent({ isAutoOpen: true });

            expect(document.querySelector(DROPDOWN_BODY)).toBeTruthy();
        });

        it("should toggle dropdown on button click", () => {
            renderComponent();

            expect(document.querySelector(DROPDOWN_BODY)).toBeFalsy();

            fireEvent.click(document.querySelector(DROPDOWN_BUTTON));
            expect(document.querySelector(DROPDOWN_BODY)).toBeTruthy();

            fireEvent.click(document.querySelector(DROPDOWN_BUTTON));
            expect(document.querySelector(DROPDOWN_BODY)).toBeFalsy();
        });

        it("should report the auto-opened dropdown closed on cancel button click and close it", () => {
            const onClose = vi.fn();
            renderComponent({ isAutoOpen: true, onClose });

            fireEvent.click(document.querySelector(".s-rf-dropdown-cancel"));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(document.querySelector(DROPDOWN_BODY)).toBeFalsy();
        });

        it("should dispatch updateRankingFilter on apply button click and close dropdown", () => {
            const { container } = renderComponent({ isAutoOpen: true });

            fireEvent.click(document.querySelector(".s-rf-operator-dropdown-button"));
            fireEvent.click(document.querySelector(".s-rf-operator-bottom"));
            fireEvent.click(document.querySelector(".s-rf-dropdown-apply"));

            expect(dispatchMock).toHaveBeenCalledWith(
                updateRankingFilter({
                    localIdentifier: "f1",
                    measureLocalIdentifier: "m1",
                    operator: "BOTTOM",
                    type: "ranking",
                    value: 10,
                }),
            );
            expect(container.querySelector(DROPDOWN_BODY)).toBeFalsy();
        });
    });

    describe("createRankingFilterModel", () => {
        it("should return correct RF component object without attributes", () => {
            const result = createRankingFilterModel(rankingFilterState);

            expect(result).toEqual({
                rankingFilter: {
                    measure: { localIdentifier: "m1" },
                    operator: "TOP",
                    value: 10,
                },
            });
        });

        it("should return correct RF component object with attributes", () => {
            const result = createRankingFilterModel(rankingFilterStateWithAttributeLocalIdentifiers);

            expect(result).toEqual({
                rankingFilter: {
                    measure: { localIdentifier: "m1" },
                    attributes: [{ localIdentifier: "a1" }],
                    operator: "TOP",
                    value: 10,
                },
            });
        });

        it("should reference catalog attributes by ObjRef and bucket attributes by local id", () => {
            const result = createRankingFilterModel(rankingFilterStateWithCatalogAttribute);

            expect(result).toEqual({
                rankingFilter: {
                    measure: { localIdentifier: "m1" },
                    attributes: [{ localIdentifier: "a1" }, idRef("attr_from_catalog", "displayForm")],
                    operator: "TOP",
                    value: 10,
                },
            });
        });

        it("should reference the ranked measure by ObjRef for a catalog metric", () => {
            const result = createRankingFilterModel(rankingFilterStateWithCatalogMeasureRef);

            expect(result).toEqual({
                rankingFilter: {
                    measure: idRef("metric_from_catalog", "measure"),
                    operator: "TOP",
                    value: 10,
                },
            });
        });
    });

    describe("createRankingFilterItem", () => {
        it("should return correct RF state object without attributes", () => {
            const result = createRankingFilterItem(rankingFilterState, rankingFilterWithoutAttributes);

            expect(result).toEqual({
                localIdentifier: "f1",
                measureLocalIdentifier: "m1",
                operator: "TOP",
                type: "ranking",
                value: 10,
            });
        });

        it("should return correct RF state object with attributes", () => {
            const result = createRankingFilterItem(rankingFilterState, rankingFilterWithAttributes);

            expect(result).toEqual({
                localIdentifier: "f1",
                measureLocalIdentifier: "m1",
                attributes: ["a1"],
                operator: "TOP",
                type: "ranking",
                value: 10,
            });
        });

        it("should store a measureRef when the ranked measure is referenced by ObjRef (catalog metric)", () => {
            const result = createRankingFilterItem(rankingFilterState, rankingFilterWithUriMeasure);

            expect(result).toEqual({
                localIdentifier: "f1",
                measureRef: uriRef("/uri"),
                attributes: ["a1"],
                operator: "TOP",
                type: "ranking",
                value: 10,
            });
        });

        it("should keep catalog attributes referenced by ObjRef in attributes", () => {
            const result = createRankingFilterItem(rankingFilterState, rankingFilterWithUriAttribute);

            expect(result).toEqual({
                localIdentifier: "f1",
                measureLocalIdentifier: "m1",
                attributes: [uriRef("/uri")],
                operator: "TOP",
                type: "ranking",
                value: 10,
            });
        });
    });
});
