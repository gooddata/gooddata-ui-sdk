// (C) 2019-2022 GoodData Corporation
import React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { DEFAULT_DATE_FORMAT } from "../../constants/Platform";
import { DateFilterBody, IDateFilterBodyProps } from "../DateFilterBody";
import { ExcludeCurrentPeriodToggle } from "../../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggle";
import { EditModeMessage } from "../EditModeMessage";
import {
    DateFilterButtonLocalized,
    IDateFilterButtonLocalizedProps,
} from "../../DateFilterButtonLocalized/DateFilterButtonLocalized";
import { IAllTimeDateFilterOption } from "@gooddata/sdk-model";

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

    const mockProps: IDateFilterBodyProps = {
        filterOptions: {},
        dateFilterButton: createDateFilterButton(),
        dateFormat: DEFAULT_DATE_FORMAT,
        selectedFilterOption: allTime,
        onSelectedFilterOptionChange: jest.fn(),

        excludeCurrentPeriod: false,
        isExcludeCurrentPeriodEnabled: false,
        onExcludeCurrentPeriodChange: jest.fn(),

        availableGranularities: [],
        isEditMode: false,
        isMobile: false,

        onApplyClick: jest.fn(),
        onCancelClick: jest.fn(),
        closeDropdown: jest.fn(),
    };

    it("should pass the isExcludeCurrentPeriodEnabled=true to Exclude button", () => {
        const rendered = shallow(<DateFilterBody {...mockProps} isExcludeCurrentPeriodEnabled={true} />);
        expect(rendered.find(ExcludeCurrentPeriodToggle)).not.toBeDisabled();
    });

    it("should pass the isExcludeCurrentPeriodEnabled=false to Exclude button", () => {
        const rendered = shallow(<DateFilterBody {...mockProps} isExcludeCurrentPeriodEnabled={false} />);
        expect(rendered.find(ExcludeCurrentPeriodToggle)).toBeDisabled();
    });

    it("should display edit mode message in edit mode", () => {
        const rendered = shallow(<DateFilterBody {...mockProps} isEditMode={true} />);
        expect(rendered.find(EditModeMessage)).toExist();
    });

    it("should not display edit mode message in normal mode", () => {
        const rendered = shallow(<DateFilterBody {...mockProps} isEditMode={false} />);
        expect(rendered.find(EditModeMessage)).not.toExist();
    });

    describe("calculateHeight", () => {
        const resizeWindow = (x: number, y: number) => {
            (window.innerWidth as number) = x;
            (window.innerHeight as number) = y;
        };

        const getBodyWrapper = (component: ShallowWrapper) => {
            return component.find(".gd-extended-date-filter-body-wrapper");
        };

        const getBodyScroller = (component: ShallowWrapper) => {
            return component.find(".gd-extended-date-filter-body-scrollable");
        };

        it("should not resize body wrapper and scroller", () => {
            const rendered = shallow(<DateFilterBody {...mockProps} isEditMode={false} />);
            expect(getBodyWrapper(rendered).props().style).toEqual({});
            expect(getBodyScroller(rendered).props().style).toEqual({});
        });

        it("should resize body wrapper and scroller in horizontal mobile layout", () => {
            resizeWindow(896, 414);
            const rendered = shallow(<DateFilterBody {...mockProps} isEditMode={false} />);
            expect(getBodyWrapper(rendered).props().style).toEqual({
                display: "block",
                height: "323px",
            });
            expect(getBodyScroller(rendered).props().style).toEqual({
                minHeight: "323px",
            });
        });
    });
});
