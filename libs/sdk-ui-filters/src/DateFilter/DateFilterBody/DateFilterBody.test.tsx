// (C) 2019-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { DEFAULT_DATE_FORMAT } from "../constants/Platform.js";
import {
    DateFilterButtonLocalized,
    type IDateFilterButtonLocalizedProps,
} from "../DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { type IUiAbsoluteDateFilterForm } from "../interfaces/index.js";

import { DateFilterBody, type IDateFilterBodyProps } from "./DateFilterBody.js";

describe("ExtendedDateFilterBody", () => {
    const allTime: IAllTimeDateFilterOption = {
        type: "allTime",
        localIdentifier: "ALL_TIME",
        name: "",
        visible: true,
    };

    const createDateFilterButton = (props?: IDateFilterButtonLocalizedProps) => {
        const defaultProps: IDateFilterButtonLocalizedProps = {
            isMobile: false,
            dateFilterOption: allTime,
            dateFormat: DEFAULT_DATE_FORMAT,
        };
        return <DateFilterButtonLocalized {...defaultProps} {...props} />;
    };

    const last7Days = {
        from: -6,
        to: 0,
        granularity: "GDC.time.date",
        localIdentifier: "LAST_7_DAYS",
        type: "relativePreset",
        visible: true,
        name: "",
    } satisfies IDateFilterBodyProps["selectedFilterOption"];

    const renderDateFilterBody = (props?: Partial<IDateFilterBodyProps>) => {
        const mockProps: IDateFilterBodyProps = {
            filterOptions: {},
            dateFilterButton: createDateFilterButton(),
            dateFormat: DEFAULT_DATE_FORMAT,
            selectedFilterOption: allTime,
            onSelectedFilterOptionChange: vi.fn(),

            excludeCurrentPeriod: false,
            hideDisabledExclude: false,
            isExcludeCurrentPeriodEnabled: false,
            onExcludeCurrentPeriodChange: vi.fn(),

            availableGranularities: [],
            isEditMode: false,
            isMobile: false,
            isTimeForAbsoluteRangeEnabled: true,

            onApplyClick: vi.fn(),
            onCancelClick: vi.fn(),
            closeDropdown: vi.fn(),
        } as unknown as IDateFilterBodyProps;
        const Wrapped = withIntlForTest(DateFilterBody);
        return render(<Wrapped {...mockProps} {...props} />);
    };

    it("should render the Exclude checkbox when enabled", () => {
        renderDateFilterBody({ selectedFilterOption: last7Days, isExcludeCurrentPeriodEnabled: true });
        expect(screen.getByRole("checkbox", { name: /Exclude/ })).not.toBeDisabled();
    });

    it("should render the Exclude checkbox as disabled when isExcludeCurrentPeriodEnabled=false", () => {
        renderDateFilterBody({ selectedFilterOption: last7Days, isExcludeCurrentPeriodEnabled: false });
        expect(screen.getByRole("checkbox", { name: /Exclude/ })).toBeDisabled();
    });

    it("should not render the Exclude checkbox when hideDisabledExclude=true and isExcludeCurrentPeriodEnabled=false", () => {
        renderDateFilterBody({
            selectedFilterOption: last7Days,
            hideDisabledExclude: true,
            isExcludeCurrentPeriodEnabled: false,
        });
        expect(screen.queryByRole("checkbox", { name: /Exclude/ })).toBeNull();
    });

    it("should not render the Exclude checkbox on mobile when it is disabled (backwards compatible)", () => {
        renderDateFilterBody({
            selectedFilterOption: last7Days,
            isMobile: true,
            isExcludeCurrentPeriodEnabled: false,
        });
        expect(screen.queryByRole("checkbox", { name: /Exclude/ })).toBeNull();
    });

    it("should display edit mode message in edit mode", () => {
        renderDateFilterBody({ isEditMode: true });
        expect(screen.queryByText("Set default date filter for viewers:")).toBeInTheDocument();
    });

    it("should not display edit mode message in normal mode", () => {
        renderDateFilterBody({ isEditMode: false });
        expect(screen.queryByText("Set default date filter for viewers:")).not.toBeInTheDocument();
    });

    describe("absolute form granularities", () => {
        const absoluteForm: IUiAbsoluteDateFilterForm = {
            localIdentifier: "ABSOLUTE_FORM",
            type: "absoluteForm",
            name: "",
            visible: true,
            availableGranularities: [
                "GDC.time.date",
                "GDC.time.week_us",
                "GDC.time.month",
                "GDC.time.quarter",
                "GDC.time.year",
            ],
        };

        it("should not render granularity tabs when isAbsoluteDateFilterGranularityEnabled is not set", () => {
            renderDateFilterBody({
                filterOptions: { absoluteForm },
                selectedFilterOption: absoluteForm,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(document.querySelector(".s-absolute-filter-form-granularity-tabs")).toBeNull();
        });

        it("should not reset granularity or clear from/to when isAbsoluteDateFilterGranularityEnabled is not set, even if availableGranularities lacks the implied granularity", () => {
            const formWithoutDateGranularity: IUiAbsoluteDateFilterForm = {
                ...absoluteForm,
                availableGranularities: ["GDC.time.month", "GDC.time.quarter"],
                from: "2026-03-01",
                to: "2026-03-31",
            };
            const onSelectedFilterOptionChange = vi.fn();

            renderDateFilterBody({
                filterOptions: { absoluteForm: formWithoutDateGranularity },
                selectedFilterOption: formWithoutDateGranularity,
                onSelectedFilterOptionChange,
            });

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(onSelectedFilterOptionChange).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    from: undefined,
                    to: undefined,
                }),
            );
        });

        it("should still offer Month/Quarter/Year even when the fiscal tab is the default (fiscal calendar active)", () => {
            renderDateFilterBody({
                filterOptions: {
                    absoluteForm,
                    relativePreset: {
                        "GDC.time.fiscal_year": [
                            {
                                from: 0,
                                to: 0,
                                granularity: "GDC.time.fiscal_year",
                                localIdentifier: "THIS_FISCAL_YEAR",
                                type: "relativePreset",
                                name: "",
                                visible: true,
                            },
                        ],
                        "GDC.time.year": [
                            {
                                from: 0,
                                to: 0,
                                granularity: "GDC.time.year",
                                localIdentifier: "THIS_YEAR",
                                type: "relativePreset",
                                name: "",
                                visible: true,
                            },
                        ],
                    },
                },
                selectedFilterOption: absoluteForm,
                isAbsoluteDateFilterGranularityEnabled: true,
                activeCalendars: { standard: true, fiscal: true, default: "FISCAL" },
            } as Partial<IDateFilterBodyProps>);

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(document.querySelector(".s-granularity-month")).not.toBeNull();
            expect(document.querySelector(".s-granularity-quarter")).not.toBeNull();
            expect(document.querySelector(".s-granularity-year")).not.toBeNull();
        });

        it("should reset to the first available granularity and clear from/to when reopening after the selected granularity was hidden", () => {
            const staleSelection: IUiAbsoluteDateFilterForm = {
                ...absoluteForm,
                availableGranularities: ["GDC.time.date", "GDC.time.week_us", "GDC.time.year"],
                granularity: "GDC.time.month",
                from: "2026-03-01",
                to: "2026-03-31",
            };
            const onSelectedFilterOptionChange = vi.fn();

            renderDateFilterBody({
                filterOptions: { absoluteForm: staleSelection },
                selectedFilterOption: staleSelection,
                onSelectedFilterOptionChange,
                isAbsoluteDateFilterGranularityEnabled: true,
            } as Partial<IDateFilterBodyProps>);

            fireEvent.click(screen.getByRole("button", { name: /Static period/i }));

            expect(onSelectedFilterOptionChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    granularity: "GDC.time.date",
                    from: undefined,
                    to: undefined,
                }),
            );
        });
    });

    describe("calculateHeight", () => {
        const resizeWindow = (x: number, y: number) => {
            window.innerWidth = x;
            window.innerHeight = y;
        };

        const getBodyWrapper = () => {
            return document.querySelector(".gd-extended-date-filter-body-wrapper");
        };

        const getBodyScroller = () => {
            const bodyScrollerClass =
                window.innerHeight <= 640
                    ? ".gd-extended-date-filter-body-scrollable-small-screen"
                    : ".gd-extended-date-filter-body-scrollable";
            return document.querySelector(bodyScrollerClass);
        };

        it("should not resize body wrapper and scroller", () => {
            renderDateFilterBody({ isEditMode: false });
            expect(getBodyWrapper()).not.toHaveAttribute("style");
            expect(getBodyScroller()).not.toHaveAttribute("style");
        });

        it("should resize body wrapper and scroller in horizontal mobile layout", () => {
            resizeWindow(896, 414);
            renderDateFilterBody({ isEditMode: false });
            expect(getBodyWrapper()).toHaveStyle("display: block; height: 323px");
            expect(getBodyScroller()).toHaveStyle("min-height: 323px");
        });

        it("should resize body wrapper and scroller in horizontal mobile layout when exclude is hidden", () => {
            resizeWindow(896, 414);
            renderDateFilterBody({ isEditMode: false, hideDisabledExclude: true });
            expect(getBodyWrapper()).toHaveStyle("display: block; height: 353px");
            expect(getBodyScroller()).toHaveStyle("min-height: 353px");
        });
    });
});
