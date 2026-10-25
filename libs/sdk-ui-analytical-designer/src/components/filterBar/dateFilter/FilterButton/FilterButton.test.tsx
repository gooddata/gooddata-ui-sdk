// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { GRANULARITY } from "../../../../models/granularity.js";
import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";
import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";
import { withIntl } from "../../../../utils/with_intl.js";
import { ALL_TIME_FILTER_OPTION, STATIC_PERIOD_FILTER_OPTION } from "../defaultFilterOptions.js";
import { RELATIVE_DATE_FILTER_PRESETS } from "../presets.js";

import { FilterButton, type IFilterButtonProps } from "./FilterButton.js";

const dayInWeekFilterLabel: IAdditionalDateFilterLabel = {
    granularity: GRANULARITY.DAY_IN_WEEK,
    isAllSelected: false,
    isInverted: true,
    selectionSize: 2,
    totalElementsCount: 7,
    selectedElements: [
        {
            title: "Mon",
            available: true,
        },
        {
            title: "Tue",
            available: true,
        },
    ],
};

const monthInYearFilterLabel: IAdditionalDateFilterLabel = {
    granularity: GRANULARITY.MONTH_IN_YEAR,
    isAllSelected: false,
    isInverted: false,
    selectionSize: 3,
    totalElementsCount: 7,
    selectedElements: [
        {
            title: "Jan",
            available: true,
        },
        {
            title: "Feb",
            available: true,
        },
        {
            title: "Mar",
            available: true,
        },
    ],
};

const defaultOverTimeComparisonSummary: IOverTimeComparisonSummary = {
    type: OverTimeComparisonTypes.NOTHING,
    compatibleMeasuresCount: 0,
    selectedMeasuresCount: 0,
};

const defaultProps: IFilterButtonProps = {
    filter: {
        filterOption: {
            ...STATIC_PERIOD_FILTER_OPTION,
            from: "2018-01-01",
            to: "2018-12-31",
        },
        excludeCurrentPeriod: false,
    },
    overTimeComparisonSummary: defaultOverTimeComparisonSummary,
    additionalDateFilterLabels: [],
    datasetTitle: "TestDateFilterTitle",
    buttonRef: null,
    dateFormat: "MM/dd/yyyy",
    onClick: vi.fn(),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    isTimeForAbsoluteRangeEnabled: false,
};

describe("GlobalDateFilterLabel", () => {
    function renderComponent(propsParam: Partial<IFilterButtonProps> = {}) {
        const Wrapped = withIntl(FilterButton);
        return render(<Wrapped {...{ ...defaultProps, ...propsParam }} />);
    }

    describe("without over time comparison", () => {
        it('should render "All time" selection value into bottom line', () => {
            renderComponent({
                filter: {
                    filterOption: ALL_TIME_FILTER_OPTION,
                    excludeCurrentPeriod: false,
                },
            });

            expect(document.querySelector(".s-global-filter-label-bottom").textContent).toBe("All time");
        });

        it('should render "Empty values" when empty values only is applied', () => {
            renderComponent({
                filter: {
                    filterOption: ALL_TIME_FILTER_OPTION,
                    excludeCurrentPeriod: false,
                },
                emptyDateValuesFilterMode: "only",
            });

            expect(document.querySelector(".s-global-filter-label-bottom").textContent).toBe("Empty values");
        });

        it('should render "All time except Empty values" when empty values are excluded', () => {
            renderComponent({
                filter: {
                    filterOption: ALL_TIME_FILTER_OPTION,
                    excludeCurrentPeriod: false,
                },
                emptyDateValuesFilterMode: "exclude",
            });

            expect(document.querySelector(".s-global-filter-label-bottom").textContent).toBe(
                "All time except Empty values",
            );
        });

        it("should render preset name", () => {
            renderComponent({
                filter: {
                    filterOption: RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"].find(
                        (p) => p.localIdentifier === "LAST_4_QUARTERS",
                    ),
                    excludeCurrentPeriod: false,
                },
            });
            const presetName = document.querySelector(".s-global-filter-label-bottom").textContent;
            expect(presetName).toBe("Last 4 quarters");
        });

        it("should keep preset name when empty values are excluded", () => {
            renderComponent({
                filter: {
                    filterOption: RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"].find(
                        (p) => p.localIdentifier === "LAST_4_QUARTERS",
                    ),
                    excludeCurrentPeriod: false,
                },
                emptyDateValuesFilterMode: "exclude",
            });

            const presetName = document.querySelector(".s-global-filter-label-bottom").textContent;
            expect(presetName).toBe("Last 4 quarters");
        });

        it("should render preset name with excluded period", () => {
            renderComponent({
                filter: {
                    filterOption: RELATIVE_DATE_FILTER_PRESETS["GDC.time.quarter"].find(
                        (p) => p.localIdentifier === "LAST_4_QUARTERS",
                    ),
                    excludeCurrentPeriod: true,
                },
            });

            const presetName = document.querySelector(".s-global-filter-label-bottom").textContent;
            expect(presetName).toBe("From 4 to 1 quarter ago");
        });

        it("should render date filter attribute title into upper line", () => {
            renderComponent();

            expect(document.querySelector(".s-global-filter-label-upper").textContent).toBe(
                "TestDateFilterTitle",
            );
        });

        describe("without time in absoluteDateFilter", () => {
            it("should render interval label as FilterLabelComponent into bottom line", () => {
                renderComponent();

                const upperLineComponent = document.querySelector(".s-global-filter-label-bottom");
                expect(upperLineComponent.textContent).toEqual("01/01/2018 – 12/31/2018");
            });

            it("should render additional date filter on the second line and title on the first", () => {
                renderComponent({
                    additionalDateFilterLabels: [dayInWeekFilterLabel],
                });
                const upperLine = document.querySelector(".s-global-filter-label-upper");
                const bottomLine = document.querySelector(".s-global-filter-label-bottom");

                expect(upperLine.textContent).toEqual("TestDateFilterTitle: 01/01/2018 – 12/31/2018");
                expect(bottomLine.textContent).toEqual("Day of Week: is not Mon, Tue");
            });

            it("should render additional date filters on the second line and title on the first", () => {
                renderComponent({
                    additionalDateFilterLabels: [dayInWeekFilterLabel, monthInYearFilterLabel],
                });
                const upperLine = document.querySelector(".s-global-filter-label-upper");
                const bottomLine = document.querySelector(".s-global-filter-label-bottom");

                expect(upperLine.textContent).toEqual("TestDateFilterTitle: 01/01/2018 – 12/31/2018");
                expect(bottomLine.textContent).toEqual("Day of Week: (5), Month of Year: (3)");
            });
        });

        describe("with time in absoluteDateFilter", () => {
            const customProps: Partial<IFilterButtonProps> = {
                filter: {
                    filterOption: {
                        ...STATIC_PERIOD_FILTER_OPTION,
                        from: "2018-01-01 1:20",
                        to: "2018-12-31 13:00",
                    },
                    excludeCurrentPeriod: false,
                },
                isTimeForAbsoluteRangeEnabled: true,
            };

            it("should render interval label as FilterLabelComponent into bottom line", () => {
                renderComponent(customProps);

                const upperLineComponent = document.querySelector(".s-global-filter-label-bottom");
                expect(upperLineComponent.textContent).toEqual("01/01/2018, 01:20 – 12/31/2018, 13:00");
            });

            it("should render additional date filter on the second line and title on the first", () => {
                renderComponent({
                    ...customProps,
                    additionalDateFilterLabels: [dayInWeekFilterLabel],
                });
                const upperLine = document.querySelector(".s-global-filter-label-upper");
                const bottomLine = document.querySelector(".s-global-filter-label-bottom");

                expect(upperLine.textContent).toEqual(
                    "TestDateFilterTitle: 01/01/2018, 01:20 – 12/31/2018, 13:00",
                );
                expect(bottomLine.textContent).toEqual("Day of Week: is not Mon, Tue");
            });

            it("should render additional date filters on the second line and title on the first", () => {
                renderComponent({
                    ...customProps,
                    additionalDateFilterLabels: [dayInWeekFilterLabel, monthInYearFilterLabel],
                });
                const upperLine = document.querySelector(".s-global-filter-label-upper");
                const bottomLine = document.querySelector(".s-global-filter-label-bottom");

                expect(upperLine.textContent).toEqual(
                    "TestDateFilterTitle: 01/01/2018, 01:20 – 12/31/2018, 13:00",
                );
                expect(bottomLine.textContent).toEqual("Day of Week: (5), Month of Year: (3)");
            });
        });

        describe("with seconds in absoluteDateFilter", () => {
            const customProps: Partial<IFilterButtonProps> = {
                filter: {
                    filterOption: {
                        ...STATIC_PERIOD_FILTER_OPTION,
                        from: "2018-01-01 00:00:30",
                        to: "2018-12-31 23:59:40",
                    },
                    excludeCurrentPeriod: false,
                },
                isTimeForAbsoluteRangeEnabled: true,
                isSecondsForAbsoluteRangeEnabled: true,
            };

            it("should render interval label including seconds into bottom line", () => {
                renderComponent(customProps);

                const bottomLine = document.querySelector(".s-global-filter-label-bottom");
                expect(bottomLine.textContent).toEqual("01/01/2018, 00:00:30 – 12/31/2018, 23:59:40");
            });
        });
    });

    describe("with over time comparison", () => {
        const overTimeComparisonSummary = {
            type: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            compatibleMeasuresCount: 10,
            selectedMeasuresCount: 9,
        };

        const overTimeComparisonSummaryWithAllSelected = {
            type: OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
            compatibleMeasuresCount: 10,
            selectedMeasuresCount: 10,
        };

        it("should render date filter attribute title next to interval label into upper line", () => {
            renderComponent({ overTimeComparisonSummary });

            expect(document.querySelector(".s-global-filter-label-upper").textContent).toBe(
                "TestDateFilterTitle: 01/01/2018 – 12/31/2018",
            );
        });

        it("should render compare to previous period info with all measures selected into bottom line", () => {
            renderComponent({
                overTimeComparisonSummary: overTimeComparisonSummaryWithAllSelected,
            });

            expect(
                document.querySelector(".s-global-filter-label-bottom .adi-compare-name").textContent,
            ).toBe("Compare (all) to: ");
        });

        it("should render compare to previous period info with not all measures selected into bottom line", () => {
            renderComponent({ overTimeComparisonSummary });

            expect(
                document.querySelector(".s-global-filter-label-bottom .adi-compare-name").textContent,
            ).toBe("Compare (9) to: ");
        });

        it("should render selected comparison type into bottom line", () => {
            renderComponent({ overTimeComparisonSummary });

            expect(
                document.querySelector(".s-global-filter-label-bottom .adi-compare-value").textContent,
            ).toBe("Same period (SP) previous year");
        });

        it("should render additional date filter on the second line before comparison", () => {
            renderComponent({
                overTimeComparisonSummary,
                additionalDateFilterLabels: [dayInWeekFilterLabel],
            });
            const upperLine = document.querySelector(".s-global-filter-label-upper");
            const bottomLine = document.querySelector(".s-global-filter-label-bottom");

            expect(upperLine.textContent).toEqual("TestDateFilterTitle: 01/01/2018 – 12/31/2018");
            expect(bottomLine.textContent).toEqual(
                "Day of Week: (5), Compare (9) to: Same period (SP) previous year",
            );
        });

        it("should render additional date filters on the second line before comparison", () => {
            renderComponent({
                overTimeComparisonSummary,
                additionalDateFilterLabels: [dayInWeekFilterLabel, monthInYearFilterLabel],
            });
            const upperLine = document.querySelector(".s-global-filter-label-upper");
            const bottomLine = document.querySelector(".s-global-filter-label-bottom");

            expect(upperLine.textContent).toEqual("TestDateFilterTitle: 01/01/2018 – 12/31/2018");
            expect(bottomLine.textContent).toEqual(
                "Day of Week: (5), Month of Year: (3), Compare (9) to: Same period (SP) previous year",
            );
        });
    });
});
