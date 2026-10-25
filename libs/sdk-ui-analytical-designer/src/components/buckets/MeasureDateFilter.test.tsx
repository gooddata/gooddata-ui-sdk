// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MEASURES } from "../../constants/bucket.js";
import { ALL_TIME, LAST_YEAR } from "../../constants/presets.js";
import { createDecoratedDateFilter } from "../../models/date_filter.js";
import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { newDecoratedBucketItem } from "../../models/decorated_bucket_item.js";
import { GRANULARITY } from "../../models/granularity.js";
import { type EmptyDateValuesFilterMode } from "../../store/filter_bar/filter_bar_types.js";
import {
    decoratedActivityDateDataset,
    decoratedClosedDateDataset,
} from "../../tests/constants.test.helpers.js";
import {
    dateDataset1,
    dateDataset2,
    dateDataset3,
    dateDatasetRefsWithGranularities as genericDateDatasetRefsWithGranularities,
} from "../../tests/DateDatasetWithGranularities.test.helpers.js";
import { type IBucketItemMetricFilter } from "../../typings/bucket_item_filter.js";
import { type IDateDatasetRefWithGranularities } from "../../typings/datasets.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";
import { RELATIVE_DATE_FILTER_PRESETS } from "../filterBar/dateFilter/presets.js";

import { type IMeasureDateFilterProps, MeasureDateFilterBase } from "./MeasureDateFilter.js";

vi.hoisted(() => {
    vi.resetModules();
});

// the additional date filter items render the attribute filter, which loads elements
vi.mock("../AttributeFilter/AttributeFilter", () => {
    return {
        AttributeFilter: vi.fn(() => <div className="s-filter-button" />),
    };
});

// Mock granularities matching the decorated date datasets used in tests
const mockDateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[] = [
    {
        ref: decoratedActivityDateDataset.ref,
        attributes: [
            {
                dateType: "GDC.time.year",
                ref: { identifier: "activity.year", type: "attribute" },
                dfRef: { identifier: "activity.year", type: "displayForm" },
                cacheIdentifier: "activity.year",
                label: "year",
            },
            {
                dateType: "GDC.time.quarter",
                ref: { identifier: "activity.quarter", type: "attribute" },
                dfRef: { identifier: "activity.quarter", type: "displayForm" },
                cacheIdentifier: "activity.quarter",
                label: "quarter",
            },
            {
                dateType: "GDC.time.month",
                ref: { identifier: "activity.month", type: "attribute" },
                dfRef: { identifier: "activity.month", type: "displayForm" },
                cacheIdentifier: "activity.month",
                label: "month",
            },
            {
                dateType: "GDC.time.week_us",
                ref: { identifier: "activity.week", type: "attribute" },
                dfRef: { identifier: "activity.week", type: "displayForm" },
                cacheIdentifier: "activity.week",
                label: "week",
            },
        ],
    },
    {
        ref: decoratedClosedDateDataset.ref,
        attributes: [
            {
                dateType: "GDC.time.year",
                ref: { identifier: "closed.year", type: "attribute" },
                dfRef: { identifier: "closed.year", type: "displayForm" },
                cacheIdentifier: "closed.year",
                label: "year",
            },
            {
                dateType: "GDC.time.quarter",
                ref: { identifier: "closed.quarter", type: "attribute" },
                dfRef: { identifier: "closed.quarter", type: "displayForm" },
                cacheIdentifier: "closed.quarter",
                label: "quarter",
            },
            {
                dateType: "GDC.time.month",
                ref: { identifier: "closed.month", type: "attribute" },
                dfRef: { identifier: "closed.month", type: "displayForm" },
                cacheIdentifier: "closed.month",
                label: "month",
            },
            {
                dateType: "GDC.time.week_us",
                ref: { identifier: "closed.week", type: "attribute" },
                dfRef: { identifier: "closed.week", type: "displayForm" },
                cacheIdentifier: "closed.week",
                label: "week",
            },
        ],
    },
];

describe("MeasureDateFilter", () => {
    const Wrapper = withRedux(withIntl(MeasureDateFilterBase));

    const defaultProps: IMeasureDateFilterProps = {
        bucketLocalIdentifier: MEASURES,
        dateDatasetsList: [decoratedActivityDateDataset, decoratedClosedDateDataset],
        dateDatasetsIsLoading: false,
        dateDatasetsUnavailableCount: 5,
        dateFormat: "MM/dd/yyyy",
        onAdd: () => {},
        onUpdate: () => {},
        onRemove: () => {},
        selectDateDataset: () => {},
        selectDateDatasetWithoutTimeTravel: () => {},
        bucketItem: newDecoratedBucketItem({ filters: [] }),
        requestMeasureDateDatasets: vi.fn(),
        callLoadDateDatasetsToDateDropdown: vi.fn(),
        projectTimezoneOffset: 0,
        selectedDateDataset: null,
        isDisabled: false,
        isDateDatasetsDropdownLoaded: false,
        formatLocale: undefined,
        enableUnavailableItemsVisibility: false,
        dateDatasetRefsWithGranularities: mockDateDatasetRefsWithGranularities,
    };

    const relativeDate = createDecoratedDateFilter(
        {
            identifier: DATE_DATASET_ATTRIBUTE,
            interval: {
                granularity: GRANULARITY.YEAR,
                interval: ["-1", "-1"],
                name: LAST_YEAR,
                type: "relative",
            },
        } as IBucketItemMetricFilter,
        undefined,
    );

    function renderComponent(props: Partial<IMeasureDateFilterProps> = {}) {
        return render(<Wrapper {...defaultProps} {...props} />);
    }

    function getFilterButton() {
        return document.querySelector(".s-metric-date-filter-button");
    }

    function getRemoveButton() {
        return document.querySelector("button.s-remove-date-filter");
    }

    describe("Filter button", () => {
        it("should render filter button", () => {
            renderComponent();
            expect(getFilterButton()).toBeInTheDocument();
        });

        it("should render filter button as disabled with bubble when measure has derived item", () => {
            renderComponent({
                bucketItem: newDecoratedBucketItem({
                    filters: [],
                }),
                isDisabled: true,
            });
            const filterButton = getFilterButton();

            expect(filterButton).toHaveClass("disabled");
        });

        it("should render filter button as enabled with bubble when measure has not derived item", () => {
            renderComponent({
                // hasDerived was never a decorated-item field (the old Record dropped it too);
                // the enabled state is driven by the isDisabled prop, which defaults to false
                bucketItem: newDecoratedBucketItem({
                    filters: [],
                }),
            });
            const filterButton = getFilterButton();

            expect(filterButton).not.toHaveClass("disabled");
        });

        it("should create class based on bucket local identifier", () => {
            renderComponent({
                bucketLocalIdentifier: "my-class",
            });

            const button = getFilterButton();
            expect(button).toHaveClass("s-my-class-bucket-id");
        });
    });

    describe("DateDatasetsDropdown", () => {
        describe("date datasets are not loaded", () => {
            it("should not render datasets button and presets list when datasets are not loaded and selected", () => {
                renderComponent({
                    dateDatasetsList: [],
                });
                const button = getFilterButton();

                fireEvent.click(button);

                const dateDatasetsDropdownButton = document.querySelectorAll(
                    ".s-date-dataset-button .gd-button",
                );
                expect(dateDatasetsDropdownButton).toHaveLength(0);

                const measureDateFilterPresets = document.querySelectorAll(".adi-tab-presets");
                expect(measureDateFilterPresets).toHaveLength(0);

                const noDateDatasetMessage = document.querySelectorAll("div.s-no-date-dataset-message");
                expect(noDateDatasetMessage).toHaveLength(1);
            });

            it("should not render datasets button and presets list when loaded datasets are not selected", () => {
                renderComponent();
                const button = getFilterButton();

                fireEvent.click(button);

                const dateDatasetsDropdownButton = document.querySelectorAll(".s-date-dataset-button");
                expect(dateDatasetsDropdownButton).toHaveLength(0);

                const measureDateFilterPresets = document.querySelectorAll(".adi-tab-presets");
                expect(measureDateFilterPresets).toHaveLength(0);

                const noDateDatasetMessage = document.querySelectorAll("div.s-no-date-dataset-message");
                expect(noDateDatasetMessage).toHaveLength(1);
            });

            it("should not render datasets button and presets list when dataset is selected but not loaded", () => {
                renderComponent({
                    dateDatasetsList: [],
                    selectedDateDataset: decoratedActivityDateDataset,
                });
                const button = getFilterButton();

                fireEvent.click(button);

                const dateDatasetsDropdownButton = document.querySelectorAll(".s-date-dataset-button");
                expect(dateDatasetsDropdownButton).toHaveLength(0);

                const measureDateFilterPresets = document.querySelectorAll(".adi-tab-presets");
                expect(measureDateFilterPresets).toHaveLength(0);

                const noDateDatasetMessage = document.querySelectorAll("div.s-no-date-dataset-message");
                expect(noDateDatasetMessage).toHaveLength(1);
            });
        });

        describe("date datasets are loaded", () => {
            let button: Element = null;

            beforeEach(() => {
                renderComponent({
                    selectedDateDataset: decoratedActivityDateDataset,
                    isDateDatasetsDropdownLoaded: true,
                });
                button = getFilterButton();
            });

            it("should render DateDatasetsDropdown button", () => {
                fireEvent.click(button);

                const dateDatasetsDropdownButton = document.querySelectorAll("button.s-date-dataset-button");

                expect(dateDatasetsDropdownButton).toHaveLength(1);

                const noDateDatasetMessage = document.querySelectorAll("div.s-no-date-dataset-message");
                expect(noDateDatasetMessage).toHaveLength(0);
            });

            it("should open DateDatasetsDropdown (dropdown NOT disabled)", () => {
                fireEvent.click(button);

                const dateDatasetsDropdownButton = document.querySelector("button.s-date-dataset-button");

                fireEvent.click(dateDatasetsDropdownButton);

                const dateDatasetsDropdownBody = document.querySelectorAll(".s-date-datasets-list");

                expect(dateDatasetsDropdownBody).toHaveLength(1);
            });

            it("should render presets", () => {
                fireEvent.click(button);

                const measureDateFilterPresets = document.querySelector("section.adi-tab-presets");

                expect(measureDateFilterPresets.textContent).toEqual(
                    [
                        "Year",
                        "This year to date (YTD)",
                        "This year",
                        "Last year",
                        "2 years ago",
                        "3 years ago",
                        "4 years ago",
                        "5 years ago",
                        "Quarter",
                        "This quarter to date (QTD)",
                        "This quarter",
                        "Last quarter",
                        "2 quarters ago",
                        "3 quarters ago",
                        "4 quarters ago",
                        "5 quarters ago",
                        "6 quarters ago",
                        "7 quarters ago",
                        "Month",
                        "This month to date (MTD)",
                        "This month",
                        "Last month",
                        "2 months ago",
                        "3 months ago",
                        "4 months ago",
                        "5 months ago",
                        "6 months ago",
                        "7 months ago",
                        "8 months ago",
                        "9 months ago",
                        "10 months ago",
                        "11 months ago",
                        "12 months ago",
                        "13 months ago",
                        "Week",
                        "This week to date (WTD)",
                        "This week",
                        "Last week",
                        "2 weeks ago",
                        "3 weeks ago",
                        "4 weeks ago",
                        "5 weeks ago",
                        "6 weeks ago",
                        "7 weeks ago",
                        "Other",
                        "Static period",
                    ].join(""),
                );
            });
        });
    });

    describe("Remove button", () => {
        it("should NOT render remove button when NO date filter applied", () => {
            renderComponent();
            const removeButton = getRemoveButton();
            expect(removeButton).not.toBeInTheDocument();
        });

        it("should render remove button when date filter applied", () => {
            const filter = createDecoratedDateFilter(
                {
                    interval: {
                        interval: ["0", "0"],
                        granularity: "GDC.time.year",
                        name: "this_year",
                    },
                },
                undefined,
            );

            renderComponent({
                filter,
            });
            const removeButton = getRemoveButton();
            expect(removeButton).toBeInTheDocument();
        });
    });

    describe("Dropdown navigation", () => {
        it("should initially open preset list", () => {
            const props = {
                filter: relativeDate,
                selectedDateDataset: decoratedActivityDateDataset,
            };

            renderComponent(props);
            const button = getFilterButton();
            fireEvent.click(button);

            const presetsContent = document.querySelectorAll(".s-presets-picker-content.invisible");
            const dateRangeContent = document.querySelectorAll(".s-date-range-picker-content.invisible");

            expect(presetsContent.length).toEqual(0);
            expect(dateRangeContent.length).toEqual(1);
        });

        it("should navigate to date range picker", () => {
            renderComponent({
                selectedDateDataset: decoratedActivityDateDataset,
            });
            const button = getFilterButton();
            fireEvent.click(button);

            let presetsContent = document.querySelectorAll(".s-presets-picker-content.invisible");
            let dateRangeContent = document.querySelectorAll(".s-date-range-picker-content.invisible");

            expect(presetsContent).toHaveLength(0);
            expect(dateRangeContent).toHaveLength(1);

            const customRangePreset = document.querySelector(".s-static_period");
            fireEvent.click(customRangePreset);

            presetsContent = document.querySelectorAll(".s-presets-picker-content.invisible");
            dateRangeContent = document.querySelectorAll(".s-date-range-picker-content.invisible");

            expect(presetsContent).toHaveLength(1);
            expect(dateRangeContent).toHaveLength(0);
        });

        it("should navigate back to preset list", () => {
            const filter = createDecoratedDateFilter(
                {
                    interval: {
                        interval: ["2017-08-31", "2017-12-31"],
                        granularity: "GDC.time.date",
                        type: "absolute",
                    },
                },
                undefined,
            );

            const props = {
                filter,
                selectedDateDataset: decoratedActivityDateDataset,
            };

            renderComponent(props);
            const button = getFilterButton();
            fireEvent.click(button);

            let presetsContent = document.querySelectorAll(".s-presets-picker-content.invisible");
            let dateRangeContent = document.querySelectorAll(".s-date-range-picker-content.invisible");

            expect(presetsContent.length).toEqual(1);
            expect(dateRangeContent.length).toEqual(0);

            const backButton = document.querySelector(".s-navigate-back-header");
            fireEvent.click(backButton);

            presetsContent = document.querySelectorAll(".s-presets-picker-content.invisible");
            dateRangeContent = document.querySelectorAll(".s-date-range-picker-content.invisible");

            expect(presetsContent.length).toEqual(0);
            expect(dateRangeContent.length).toEqual(1);
        });
    });

    describe("Custom date range", () => {
        it("should close dropdown onCancel", () => {
            renderComponent({
                selectedDateDataset: decoratedActivityDateDataset,
            });
            const button = getFilterButton();

            fireEvent.click(button);

            const customRangePreset = document.querySelector(".s-static_period");
            fireEvent.click(customRangePreset);

            const cancelButton = document.querySelector(".s-date-range-cancel");
            fireEvent.click(cancelButton);

            const portalWrapperAfter = document.querySelectorAll(".s-metric-date-filter-dropdown");
            expect(portalWrapperAfter).toHaveLength(0);
        });

        it("should set date range onApply", () => {
            const onAdd = vi.fn();

            renderComponent({
                selectedDateDataset: decoratedActivityDateDataset,
                onAdd,
            });
            const button = getFilterButton();

            fireEvent.click(button);

            const customRangePreset = document.querySelector(".s-static_period");
            fireEvent.click(customRangePreset);

            const applyButton = document.querySelector(".s-date-range-apply");
            fireEvent.click(applyButton);

            expect(onAdd).toHaveBeenCalledTimes(1);
        });
    });

    describe("Measure date datasets", () => {
        it("should fire 'requestMeasureDateDatasets' prop callback when dropdown is opened", () => {
            const requestMeasureDateDatasets = vi.fn();
            renderComponent({ requestMeasureDateDatasets });
            const button = getFilterButton();
            fireEvent.click(button);
            expect(requestMeasureDateDatasets).toBeCalled();
        });
    });

    describe("selectDateDataset", () => {
        it("should be called when dataset preset is selected", () => {
            return new Promise<void>((resolve) => {
                const selectDateDataset = () => {
                    resolve();
                };

                renderComponent({
                    selectedDateDataset: decoratedClosedDateDataset,
                    filter: relativeDate,
                    selectDateDataset,
                    isDateDatasetsDropdownLoaded: true,
                });
                const button = getFilterButton();
                fireEvent.click(button);

                fireEvent.click(document.querySelector(".s-date-dataset-button"));

                const closedDateDatasetComponent = document.querySelector(
                    ".s-date-datasets-list .s-week_year__closed_",
                );
                fireEvent.click(closedDateDatasetComponent);
            });
        });

        it("should not be called when no dataset preset is selected", () => {
            const selectDateDataset = vi.fn();
            renderComponent({
                selectedDateDataset: decoratedClosedDateDataset,
                selectDateDataset,
                isDateDatasetsDropdownLoaded: true,
            });
            const button = getFilterButton();
            fireEvent.click(button);

            fireEvent.click(document.querySelector(".s-date-dataset-button"));

            fireEvent.click(document.querySelector(".s-date-datasets-list .s-week_year__closed_"));

            expect(selectDateDataset).not.toHaveBeenCalled();
        });
    });

    describe("onAdd & onUpdate", () => {
        it("should call onAdd() with expected parameters when measure date filter is added", () => {
            const onAdd = vi.fn();
            const onUpdate = vi.fn();

            renderComponent({
                selectedDateDataset: decoratedActivityDateDataset,
                onAdd,
                onUpdate,
            });
            const button = getFilterButton();
            fireEvent.click(button);

            fireEvent.click(document.querySelector(".s-this_year"));

            expect(onAdd).toBeCalledWith(
                {
                    identifier: DATE_DATASET_ATTRIBUTE,
                    interval: {
                        granularity: "GDC.time.year",
                        interval: [0, 0],
                        name: "this_year",
                    },
                },
                decoratedActivityDateDataset.identifier,
            );
            expect(onUpdate).not.toHaveBeenCalled();
        });

        it("should call onUpdated() with expected parameters when measure date filter is updated", () => {
            const onAdd = vi.fn();
            const onUpdate = vi.fn();

            renderComponent({
                selectedDateDataset: decoratedActivityDateDataset,
                filter: relativeDate,
                onAdd,
                onUpdate,
            });

            const button = getFilterButton();
            fireEvent.click(button);

            fireEvent.click(document.querySelector(".s-this_year"));

            expect(onAdd).not.toHaveBeenCalled();
            expect(onUpdate).toHaveBeenCalledWith(relativeDate, {
                identifier: DATE_DATASET_ATTRIBUTE,
                interval: {
                    granularity: "GDC.time.year",
                    interval: [0, 0],
                    name: "this_year",
                },
            });
        });
    });

    describe("improved metric date filter", () => {
        const improvedProps: Partial<IMeasureDateFilterProps> = {
            isImprovedMetricDateFilterEnabled: true,
            relativeDateFilterPresets: RELATIVE_DATE_FILTER_PRESETS,
            selectedDateDataset: decoratedActivityDateDataset,
        };

        const pickPreset = (presetClassName: string) => {
            fireEvent.click(document.querySelector(".s-date-preset-button"));
            fireEvent.click(document.querySelector(presetClassName));
        };

        it("keeps the legacy dropdown while the flag is off", () => {
            renderComponent({ selectedDateDataset: decoratedActivityDateDataset });
            fireEvent.click(getFilterButton());

            expect(document.querySelector(".s-this_year")).toBeInTheDocument();
            expect(document.querySelector(".s-filter-picker")).not.toBeInTheDocument();
        });

        it("opens the same picker as the insight date filter, without comparison", () => {
            renderComponent(improvedProps);
            fireEvent.click(getFilterButton());

            expect(document.querySelector(".s-filter-picker")).toBeInTheDocument();
            expect(document.querySelector(".s-filter-date-date-dataset-switch")).toBeInTheDocument();
            expect(document.querySelector(".s-preset-section")).toBeInTheDocument();
            expect(document.querySelector(".s-this_year")).not.toBeInTheDocument();
        });

        it("opens its picker on mount when told to, the way the Add filter menu mounts it", () => {
            const onApply = vi.fn();
            renderComponent({ ...improvedProps, autoOpen: true, onApply });

            expect(document.querySelector(".s-filter-picker")).toBeInTheDocument();
            // the add of the All time filter that goes with opening an empty chip
            expect(onApply).toHaveBeenCalledTimes(1);
        });

        it("reports its picker closing", () => {
            const onDropdownClosed = vi.fn();
            renderComponent({ ...improvedProps, onDropdownClosed });
            fireEvent.click(getFilterButton());
            expect(onDropdownClosed).not.toHaveBeenCalled();

            fireEvent.click(getFilterButton());

            expect(onDropdownClosed).toHaveBeenCalledTimes(1);
        });

        it("covers the picker with the loading state while known date datasets reload", () => {
            renderComponent({ ...improvedProps, dateDatasetsIsLoading: true });
            fireEvent.click(getFilterButton());

            expect(
                document.querySelector(".s-filter-picker .s-metric-date-filter-loading"),
            ).toBeInTheDocument();
            expect(document.querySelector(".s-filter-picker .s-preset-section")).toBeInTheDocument();
        });

        it("lays out the picker under the loading state on the first load, before any date dataset is known", () => {
            renderComponent({
                ...improvedProps,
                dateDatasetsIsLoading: true,
                dateDatasetsList: [],
                selectedDateDataset: null,
            });
            fireEvent.click(getFilterButton());

            expect(
                document.querySelector(".s-filter-picker .s-metric-date-filter-loading"),
            ).toBeInTheDocument();
            expect(document.querySelector(".s-filter-picker .s-preset-section")).toBeInTheDocument();
        });

        it("shows the no date datasets message when loading finds none", () => {
            renderComponent({ ...improvedProps, dateDatasetsList: [], selectedDateDataset: null });
            fireEvent.click(getFilterButton());

            expect(document.querySelector(".s-no-date-dataset-message")).toBeInTheDocument();
            expect(document.querySelector(".s-preset-section")).not.toBeInTheDocument();
        });

        it("removes the loading layer once the date datasets are loaded", () => {
            renderComponent(improvedProps);
            fireEvent.click(getFilterButton());

            expect(document.querySelector(".s-metric-date-filter-loading")).not.toBeInTheDocument();
        });

        it("adds the filter as All time on click and opens the picker to edit it", () => {
            const onAdd = vi.fn();
            const onApply = vi.fn();
            renderComponent({ ...improvedProps, onAdd, onApply });
            fireEvent.click(getFilterButton());

            // one gesture through the shared apply path (one undo step), not the legacy add
            expect(onAdd).not.toHaveBeenCalled();
            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenCalledWith({
                dateFilter: undefined,
                dateFilterOption: expect.objectContaining({
                    filterOption: expect.objectContaining({ type: "allTime" }),
                }),
                dateDatasetIdentifier: decoratedActivityDateDataset.identifier,
                additionalDateFilters: [],
            });
            expect(document.querySelector(".s-filter-picker")).toBeInTheDocument();
            expect(document.querySelector(".s-date-filter-apply")).toHaveClass("disabled");

            pickPreset(".s-relative-preset-this-year");
            fireEvent.click(document.querySelector(".s-date-filter-apply"));

            expect(onApply).toHaveBeenCalledTimes(2);
            expect(onApply).toHaveBeenLastCalledWith({
                dateFilter: undefined,
                dateFilterOption: expect.objectContaining({
                    filterOption: expect.objectContaining({
                        type: "relativePreset",
                        granularity: "GDC.time.year",
                        from: 0,
                        to: 0,
                        localIdentifier: "THIS_YEAR",
                    }),
                    excludeCurrentPeriod: false,
                }),
                dateDatasetIdentifier: decoratedActivityDateDataset.identifier,
                additionalDateFilters: [],
            });
        });

        it("waits for the date datasets to load before adding the filter, and cancels the add on close", () => {
            const onApply = vi.fn();
            const loadingProps: IMeasureDateFilterProps = {
                ...defaultProps,
                ...improvedProps,
                onApply,
                selectedDateDataset: null,
                dateDatasetsIsLoading: true,
            };
            const { rerender } = render(<Wrapper {...loadingProps} />);
            fireEvent.click(getFilterButton());
            expect(onApply).not.toHaveBeenCalled();

            rerender(
                <Wrapper
                    {...loadingProps}
                    dateDatasetsIsLoading={false}
                    selectedDateDataset={decoratedActivityDateDataset}
                />,
            );

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toHaveBeenCalledWith(
                expect.objectContaining({ dateDatasetIdentifier: decoratedActivityDateDataset.identifier }),
            );
        });

        it("does not add the filter when the picker is closed before the date datasets load", () => {
            const onApply = vi.fn();
            const loadingProps: IMeasureDateFilterProps = {
                ...defaultProps,
                ...improvedProps,
                onApply,
                selectedDateDataset: null,
                dateDatasetsIsLoading: true,
            };
            const { rerender } = render(<Wrapper {...loadingProps} />);
            fireEvent.click(getFilterButton());
            fireEvent.click(getFilterButton());

            rerender(
                <Wrapper
                    {...loadingProps}
                    dateDatasetsIsLoading={false}
                    selectedDateDataset={decoratedActivityDateDataset}
                />,
            );

            expect(onApply).not.toHaveBeenCalled();
        });

        it("follows its filter prop: the same chip shows the next filter after a removal", () => {
            const props: IMeasureDateFilterProps = {
                ...defaultProps,
                ...improvedProps,
                filter: relativeDate,
            };
            const { rerender } = render(<Wrapper {...props} />);
            expect(getFilterButton()).toHaveTextContent(/last year/i);

            // the primary was removed: this instance now shows the next date filter
            fireEvent.click(getRemoveButton());
            const allTimeFilter = createDecoratedDateFilter(
                {
                    identifier: DATE_DATASET_ATTRIBUTE,
                    interval: { name: "all_time" },
                } as IBucketItemMetricFilter,
                undefined,
            );
            rerender(<Wrapper {...props} filter={allTimeFilter} />);

            expect(getFilterButton()).toHaveTextContent(/all time/i);
            expect(getRemoveButton()).toBeInTheDocument();
        });

        it("keeps the metric's date attribute filters when the date filter is added", () => {
            const onApply = vi.fn();
            renderComponent({
                ...improvedProps,
                onApply,
                additionalDateFilters: [
                    {
                        localIdentifier: "moy",
                        attribute: "DATE1.monthOfYear",
                        displayFormRef: { identifier: "DATE1.monthOfYear", type: "displayForm" },
                        selectedElements: [{ uri: "1", title: "1" }],
                        isInverted: true,
                        totalElementsCount: 12,
                    },
                ],
            });
            fireEvent.click(getFilterButton());

            expect(onApply).toHaveBeenCalledWith(
                expect.objectContaining({
                    additionalDateFilters: [expect.objectContaining({ localIdentifier: "moy" })],
                }),
            );
        });

        it("opens an existing filter without touching it, and names it on Apply", () => {
            const onApply = vi.fn();
            renderComponent({ ...improvedProps, filter: relativeDate, onApply });
            fireEvent.click(getFilterButton());

            expect(onApply).not.toHaveBeenCalled();
            expect(document.querySelector(".s-filter-picker")).toBeInTheDocument();

            pickPreset(".s-relative-preset-this-year");
            fireEvent.click(document.querySelector(".s-date-filter-apply"));

            expect(onApply).toHaveBeenCalledWith(
                expect.objectContaining({ dateFilter: relativeDate.original }),
            );
        });

        it("offers no additional date filters and no removal of them to a further date filter", () => {
            const onRemove = vi.fn();
            renderComponent({
                ...improvedProps,
                areAdditionalDateFiltersSupported: true,
                isPrimaryDateFilter: false,
                filter: relativeDate,
                onRemove,
            });
            fireEvent.click(getFilterButton());
            expect(
                document.querySelector(".s-adi-additional-date-granularities-dropdown-button"),
            ).not.toBeInTheDocument();

            fireEvent.click(getRemoveButton());
            expect(onRemove).toHaveBeenCalledWith(relativeDate.original, false);
        });

        describe("additional date filters", () => {
            const additionalFilterProps: Partial<IMeasureDateFilterProps> = {
                ...improvedProps,
                areAdditionalDateFiltersSupported: true,
                selectedDateDataset: dateDataset1,
                dateDatasetsList: [dateDataset1],
                dateDatasetRefsWithGranularities: genericDateDatasetRefsWithGranularities,
            };
            const monthOfYearDisplayForm = { identifier: "DATE1.monthOfYear", type: "displayForm" as const };
            const storedMonthOfYear: IBucketItemMetricFilter = {
                localIdentifier: "moy",
                attribute: "DATE1.monthOfYear",
                displayFormRef: monthOfYearDisplayForm,
                selectedElements: [{ uri: "1", title: "January" }],
                isInverted: false,
                totalElementsCount: 12,
            };
            const getAddButton = () =>
                document.querySelector(".s-adi-additional-date-granularities-dropdown-button");

            it("offers them under the presets when the backend supports them", () => {
                renderComponent(additionalFilterProps);
                fireEvent.click(getFilterButton());

                expect(getAddButton()).toBeInTheDocument();
            });

            it("does not offer them when the backend cannot serve date attribute elements", () => {
                renderComponent({ ...additionalFilterProps, areAdditionalDateFiltersSupported: false });
                fireEvent.click(getFilterButton());

                expect(getAddButton()).not.toBeInTheDocument();
            });

            it("applies an added additional date filter together with the period", () => {
                const onApply = vi.fn();
                renderComponent({ ...additionalFilterProps, onApply });
                fireEvent.click(getFilterButton());

                pickPreset(".s-relative-preset-this-year");
                fireEvent.click(getAddButton());
                fireEvent.click(
                    document.querySelector(
                        '.s-granularity-item[class*="month_in_year"], .s-granularity-item[class*="monthinyear"]',
                    ),
                );
                fireEvent.click(document.querySelector(".s-date-filter-apply"));

                // the click added the filter as All time; Apply carries the picked period and filter
                expect(onApply).toHaveBeenCalledTimes(2);
                expect(onApply).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        dateFilterOption: expect.objectContaining({
                            filterOption: expect.objectContaining({
                                granularity: "GDC.time.year",
                                from: 0,
                                to: 0,
                            }),
                        }),
                        dateDatasetIdentifier: dateDataset1.identifier,
                        additionalDateFilters: [
                            expect.objectContaining({
                                cacheItemIdentifier: "DATE1.monthOfYear",
                                displayFormRef: monthOfYearDisplayForm,
                            }),
                        ],
                    }),
                );
            });

            it("shows them on the button after the period, one per line in the tooltip", async () => {
                const dayOfWeekDisplayForm = { identifier: "DATE1.dayOfWeek", type: "displayForm" as const };
                renderComponent({
                    ...additionalFilterProps,
                    filter: relativeDate,
                    additionalDateFilters: [
                        storedMonthOfYear,
                        {
                            localIdentifier: "dow",
                            attribute: "DATE1.dayOfWeek",
                            displayFormRef: dayOfWeekDisplayForm,
                            selectedElements: [{ uri: "1", title: "Monday" }],
                            isInverted: true,
                            totalElementsCount: 7,
                        },
                    ],
                    dateAttributes: [
                        { dfRef: monthOfYearDisplayForm, dateType: "GDC.time.month_in_year" },
                        { dfRef: dayOfWeekDisplayForm, dateType: "GDC.time.day_in_week" },
                    ],
                });

                // several filters show their selection size, like on the filter bar's button
                expect(getFilterButton()).toHaveTextContent("Month of Year: (1), Day of Week: (6)");
                const anchor = getFilterButton().querySelector(".gd-ui-kit-tooltip__anchor");
                fireEvent.mouseEnter(anchor);
                fireEvent.mouseMove(anchor);
                await waitFor(() => {
                    const lines = [...document.querySelectorAll(".s-metric-date-filter-tooltip > div")].map(
                        (line) => line.textContent,
                    );
                    expect(lines).toEqual(["Last year", "Month of Year: (1)", "Day of Week: (6)"]);
                });
            });

            it("lists the values of a filter whose total is unknown, even next to other filters", () => {
                const dayOfWeekDisplayForm = { identifier: "DATE1.dayOfWeek", type: "displayForm" as const };
                const { totalElementsCount: _total, ...monthOfYearWithoutTotal } = storedMonthOfYear;
                renderComponent({
                    ...additionalFilterProps,
                    filter: relativeDate,
                    additionalDateFilters: [
                        { ...monthOfYearWithoutTotal, isInverted: true },
                        {
                            localIdentifier: "dow",
                            attribute: "DATE1.dayOfWeek",
                            displayFormRef: dayOfWeekDisplayForm,
                            selectedElements: [{ uri: "1", title: "Monday" }],
                            isInverted: true,
                            totalElementsCount: 7,
                        },
                    ],
                    dateAttributes: [
                        { dfRef: monthOfYearDisplayForm, dateType: "GDC.time.month_in_year" },
                        { dfRef: dayOfWeekDisplayForm, dateType: "GDC.time.day_in_week" },
                    ],
                });

                expect(getFilterButton()).toHaveTextContent(
                    "Month of Year: is not January, Day of Week: (6)",
                );
            });

            it("lists a lone filter's values on the button", () => {
                renderComponent({
                    ...additionalFilterProps,
                    filter: relativeDate,
                    additionalDateFilters: [storedMonthOfYear],
                    dateAttributes: [{ dfRef: monthOfYearDisplayForm, dateType: "GDC.time.month_in_year" }],
                });

                expect(getFilterButton()).toHaveTextContent("Month of Year: January");
            });

            it("lists the stored ones in the picker", () => {
                renderComponent({
                    ...additionalFilterProps,
                    filter: relativeDate,
                    additionalDateFilters: [storedMonthOfYear],
                });
                fireEvent.click(getFilterButton());

                expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(1);
            });

            it("removes them together with the date filter", () => {
                const onRemove = vi.fn();
                renderComponent({
                    ...additionalFilterProps,
                    filter: relativeDate,
                    additionalDateFilters: [storedMonthOfYear],
                    onRemove,
                });

                fireEvent.click(getRemoveButton());

                // one removal carrying the additional date filters — one undo step
                expect(onRemove).toHaveBeenCalledTimes(1);
                expect(onRemove).toHaveBeenCalledWith(relativeDate.original, true);
            });

            describe("on a date dimension change", () => {
                const minuteOfHourDisplayForm = {
                    identifier: "DATE1.minuteOfHour",
                    type: "displayForm" as const,
                };
                const storedMinuteOfHour: IBucketItemMetricFilter = {
                    localIdentifier: "moh",
                    attribute: "DATE1.minuteOfHour",
                    displayFormRef: minuteOfHourDisplayForm,
                    selectedElements: [{ uri: "30", title: "30" }],
                    isInverted: false,
                    totalElementsCount: 60,
                };
                // the fixture datasets carry no availability, and unavailable ones are listed only on demand
                const availableDataset1 = { ...dateDataset1, isAvailable: true };
                const availableDataset2 = { ...dateDataset2, isAvailable: true };
                const availableDataset3 = { ...dateDataset3, isAvailable: true };
                const pickDataset = (datasetClassName: string, index = 0) => {
                    fireEvent.click(document.querySelector(".s-date-dataset-button"));
                    fireEvent.click(
                        document.querySelectorAll(`.s-date-datasets-list ${datasetClassName}`)[index],
                    );
                };
                const getWarningPanel = () =>
                    document.querySelector(
                        ".s-additional-filter-reset-warning, .s-additional-filter-reset-warnings",
                    );

                it("keeps the selection of a filter the new dimension has the granularity for", () => {
                    const onApply = vi.fn();
                    renderComponent({
                        ...additionalFilterProps,
                        filter: relativeDate,
                        additionalDateFilters: [storedMonthOfYear],
                        selectedDateDataset: availableDataset1,
                        dateDatasetsList: [availableDataset1, availableDataset2],
                        isDateDatasetsDropdownLoaded: true,
                        onApply,
                    });
                    fireEvent.click(getFilterButton());

                    pickDataset(".s-dataset_2");

                    expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(1);
                    expect(getWarningPanel()).not.toBeInTheDocument();

                    fireEvent.click(document.querySelector(".s-date-filter-apply"));
                    expect(onApply).toHaveBeenLastCalledWith(
                        expect.objectContaining({
                            dateDatasetIdentifier: dateDataset2.identifier,
                            additionalDateFilters: [
                                expect.objectContaining({
                                    cacheItemIdentifier: "DATE2.monthOfYear",
                                    displayFormRef: { identifier: "DATE2.monthOfYear", type: "displayForm" },
                                    filterConfig: expect.objectContaining({
                                        selectedElements: [{ uri: "1", title: "January" }],
                                        isInverted: false,
                                        totalElementsCount: 12,
                                    }),
                                }),
                            ],
                        }),
                    );
                });

                it("removes a filter the new dimension lacks the granularity for and warns about it", () => {
                    renderComponent({
                        ...additionalFilterProps,
                        filter: relativeDate,
                        additionalDateFilters: [storedMonthOfYear, storedMinuteOfHour],
                        selectedDateDataset: availableDataset1,
                        dateDatasetsList: [availableDataset1, availableDataset3],
                        isDateDatasetsDropdownLoaded: true,
                    });
                    fireEvent.click(getFilterButton());
                    expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(2);

                    // both fixture datasets share the title, the second entry is DATE3 (no minute of hour)
                    pickDataset(".s-dataset_3", 1);

                    expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(1);
                    expect(document.querySelector(".s-additional-filter-reset-warning")).toBeInTheDocument();
                });

                it("dismisses the warning as soon as the period changes", () => {
                    renderComponent({
                        ...additionalFilterProps,
                        filter: relativeDate,
                        additionalDateFilters: [storedMinuteOfHour],
                        selectedDateDataset: availableDataset1,
                        dateDatasetsList: [availableDataset1, availableDataset3],
                        isDateDatasetsDropdownLoaded: true,
                    });
                    fireEvent.click(getFilterButton());
                    pickDataset(".s-dataset_3", 1);
                    expect(getWarningPanel()).toBeInTheDocument();

                    fireEvent.click(document.querySelector(".s-date-preset-button"));
                    fireEvent.click(document.querySelector(".s-date-presets-list .s-preset-absolute-form"));

                    expect(getWarningPanel()).not.toBeInTheDocument();
                });

                it("dismisses the warning when a later dimension change has every granularity", () => {
                    renderComponent({
                        ...additionalFilterProps,
                        filter: relativeDate,
                        additionalDateFilters: [storedMonthOfYear, storedMinuteOfHour],
                        selectedDateDataset: availableDataset1,
                        dateDatasetsList: [availableDataset1, availableDataset3],
                        isDateDatasetsDropdownLoaded: true,
                    });
                    fireEvent.click(getFilterButton());
                    pickDataset(".s-dataset_3", 1);
                    expect(document.querySelector(".s-additional-filter-reset-warning")).toBeInTheDocument();

                    // back on DATE1, which has minute of hour: the change is an edit, so the warning is dismissed
                    pickDataset(".s-dataset_3", 0);

                    expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(1);
                    expect(
                        document.querySelector(".s-additional-filter-reset-warning"),
                    ).not.toBeInTheDocument();
                });

                it("dismisses the warning as soon as another additional filter is added", () => {
                    renderComponent({
                        ...additionalFilterProps,
                        filter: relativeDate,
                        additionalDateFilters: [storedMinuteOfHour],
                        selectedDateDataset: availableDataset1,
                        dateDatasetsList: [availableDataset1, availableDataset3],
                        isDateDatasetsDropdownLoaded: true,
                    });
                    fireEvent.click(getFilterButton());
                    pickDataset(".s-dataset_3", 1);
                    expect(getWarningPanel()).toBeInTheDocument();

                    fireEvent.click(getAddButton());
                    fireEvent.click(document.querySelector(".s-granularity-item.s-day_in_week"));

                    expect(document.querySelectorAll(".s-adi-additional-date-attribute")).toHaveLength(1);
                    expect(getWarningPanel()).not.toBeInTheDocument();
                });
            });

            it("leaves them alone on removal when the backend cannot serve date attribute elements", () => {
                const onRemove = vi.fn();
                renderComponent({
                    ...additionalFilterProps,
                    areAdditionalDateFiltersSupported: false,
                    filter: relativeDate,
                    additionalDateFilters: [storedMonthOfYear],
                    onRemove,
                });

                fireEvent.click(getRemoveButton());

                // they are listed as regular attribute filters then, so they stay
                expect(onRemove).toHaveBeenCalledWith(relativeDate.original, false);
            });
        });

        it("labels an hour filter with the shared date filter title", () => {
            const hourFilter = createDecoratedDateFilter(
                {
                    identifier: DATE_DATASET_ATTRIBUTE,
                    interval: { type: "relative", granularity: "GDC.time.hour", interval: [-1, -1] },
                } as IBucketItemMetricFilter,
                undefined,
            );
            renderComponent({ ...improvedProps, filter: hourFilter });

            expect(getFilterButton()).toHaveTextContent(/last hour/i);
        });

        it("offers All time, so a metric can be filtered by date attributes alone", () => {
            renderComponent({ ...improvedProps, filter: relativeDate });
            fireEvent.click(getFilterButton());
            fireEvent.click(document.querySelector(".s-date-preset-button"));

            expect(document.querySelector(".s-date-presets-list")).toBeInTheDocument();
            expect(document.querySelector(".s-preset-all-time")).toBeInTheDocument();
        });

        it("labels a stored All time filter", () => {
            const allTimeFilter = createDecoratedDateFilter(
                {
                    identifier: DATE_DATASET_ATTRIBUTE,
                    interval: { name: "all_time" },
                } as IBucketItemMetricFilter,
                undefined,
            );
            renderComponent({ ...improvedProps, filter: allTimeFilter });

            expect(getFilterButton()).toHaveTextContent(/all time/i);
        });

        describe("empty date values", () => {
            const emptyValuesProps: Partial<IMeasureDateFilterProps> = {
                ...improvedProps,
                areAdditionalDateFiltersSupported: true,
                selectedDateDataset: dateDataset1,
                dateDatasetsList: [dateDataset1],
                dateDatasetRefsWithGranularities: genericDateDatasetRefsWithGranularities,
            };
            const storedWithMode = (emptyDateValuesFilter: EmptyDateValuesFilterMode) =>
                createDecoratedDateFilter(
                    {
                        attribute: DATE_DATASET_ATTRIBUTE,
                        interval: { name: ALL_TIME },
                        emptyDateValuesFilter,
                    } as IBucketItemMetricFilter,
                    undefined,
                );
            const getAddButton = () =>
                document.querySelector(".s-adi-additional-date-granularities-dropdown-button");
            const getModeDropdownButton = () => document.querySelector(".s-adi-empty-values-filter-button");
            const pickMode = (mode: EmptyDateValuesFilterMode) => {
                if (!document.querySelector(".adi-empty-values-filter-dropdown")) {
                    fireEvent.click(getModeDropdownButton());
                }
                fireEvent.click(
                    document.querySelector(
                        `.adi-empty-values-filter-dropdown [id$="-${mode}"] .gd-ui-kit-listbox__item`,
                    ),
                );
            };

            it("offers the empty values filter among the additional filters, like the filter bar", () => {
                renderComponent(emptyValuesProps);
                fireEvent.click(getFilterButton());
                fireEvent.click(getAddButton());

                expect(document.querySelector(".s-adi-empty-values-filter-item")).toBeInTheDocument();
            });

            it("applies the picked mode with the period; only forces All time and drops additional filters", () => {
                const onApply = vi.fn();
                renderComponent({ ...emptyValuesProps, onApply });
                fireEvent.click(getFilterButton());

                pickPreset(".s-relative-preset-this-year");
                fireEvent.click(getAddButton());
                fireEvent.click(document.querySelector(".s-adi-empty-values-filter-item"));
                pickMode("only");
                fireEvent.click(document.querySelector(".s-date-filter-apply"));

                expect(onApply).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        dateFilterOption: expect.objectContaining({
                            filterOption: expect.objectContaining({ type: "allTime" }),
                        }),
                        additionalDateFilters: [],
                        emptyDateValuesFilter: "only",
                    }),
                );
            });

            it("resets the local period and additional filters to All time as soon as only is picked", () => {
                renderComponent(emptyValuesProps);
                fireEvent.click(getFilterButton());

                pickPreset(".s-relative-preset-this-year");
                fireEvent.click(getAddButton());
                fireEvent.click(document.querySelector(".s-adi-empty-values-filter-item"));
                expect(document.querySelector(".s-date-preset-button")).not.toHaveTextContent("All time");

                pickMode("only");

                expect(document.querySelector(".s-date-preset-button")).toHaveTextContent("All time");
            });

            it("applies exclude with the picked period", () => {
                const onApply = vi.fn();
                renderComponent({ ...emptyValuesProps, onApply });
                fireEvent.click(getFilterButton());

                pickPreset(".s-relative-preset-this-year");
                fireEvent.click(getAddButton());
                // adding the filter starts it as exclude
                fireEvent.click(document.querySelector(".s-adi-empty-values-filter-item"));
                fireEvent.click(document.querySelector(".s-date-filter-apply"));

                expect(onApply).toHaveBeenLastCalledWith(
                    expect.objectContaining({
                        dateFilterOption: expect.objectContaining({
                            filterOption: expect.objectContaining({ granularity: "GDC.time.year" }),
                        }),
                        emptyDateValuesFilter: "exclude",
                    }),
                );
            });

            it("shows the stored mode on the chip the way the filter bar's button does", () => {
                const { unmount } = renderComponent({ ...emptyValuesProps, filter: storedWithMode("only") });
                expect(getFilterButton()).toHaveTextContent("Empty values");
                expect(getFilterButton()).not.toHaveTextContent("All time");
                unmount();

                renderComponent({ ...emptyValuesProps, filter: storedWithMode("exclude") });
                expect(getFilterButton()).toHaveTextContent("All time except Empty values");
            });
        });
    });
});
