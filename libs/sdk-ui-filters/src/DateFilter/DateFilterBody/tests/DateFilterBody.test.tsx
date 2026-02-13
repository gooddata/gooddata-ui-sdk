// (C) 2019-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAllTimeDateFilterOption } from "@gooddata/sdk-model";
import { withIntl } from "@gooddata/sdk-ui";

import { DEFAULT_DATE_FORMAT } from "../../constants/Platform.js";
import {
    DateFilterButtonLocalized,
    type IDateFilterButtonLocalizedProps,
} from "../../DateFilterButtonLocalized/DateFilterButtonLocalized.js";
import { DateFilterBody, type IDateFilterBodyProps } from "../DateFilterBody.js";

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
        const Wrapped = withIntl(DateFilterBody);
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
