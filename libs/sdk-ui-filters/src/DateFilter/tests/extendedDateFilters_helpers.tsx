// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { platformDateFormat } from "../constants/Platform";
import moment = require("moment");
import noop = require("lodash/noop");
import { IDateFilterProps, DateFilter } from "../DateFilter";
import { ExtendedDateFilters } from "../interfaces/ExtendedDateFilters";

export const defaultDateFilterOptions: ExtendedDateFilters.IDateFilterOptionsByType = {
    allTime: {
        localIdentifier: "ALL_TIME",
        type: "allTime",
        name: "",
        visible: true,
    },
    absoluteForm: {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        from: moment()
            .subtract(1, "month")
            .startOf("day")
            .format(platformDateFormat),
        to: moment()
            .startOf("day")
            .format(platformDateFormat),
        name: "",
        visible: true,
    },
    absolutePreset: [
        {
            from: "2019-12-24",
            to: "2019-12-26",
            name: "Christmas 2019",
            localIdentifier: "CHRISTMAS_2019",
            visible: true,
            type: "absolutePreset",
        },
        {
            from: "2018-01-01",
            to: "2018-12-31",
            name: "Year 2018",
            localIdentifier: "YEAR_2018",
            visible: true,
            type: "absolutePreset",
        },
    ],
    relativeForm: {
        localIdentifier: "RELATIVE_FORM",
        type: "relativeForm",
        granularity: "GDC.time.month",
        from: undefined,
        to: undefined,
        name: "",
        visible: true,
        availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter", "GDC.time.year"],
    },
    relativePreset: {
        "GDC.time.date": [
            {
                from: -6,
                to: 0,
                granularity: "GDC.time.date",
                localIdentifier: "LAST_7_DAYS",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -29,
                to: 0,
                granularity: "GDC.time.date",
                localIdentifier: "LAST_30_DAYS",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -89,
                to: 0,
                granularity: "GDC.time.date",
                localIdentifier: "LAST_90_DAYS",
                type: "relativePreset",
                visible: true,
                name: "",
            },
        ],
        "GDC.time.month": [
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.month",
                localIdentifier: "THIS_MONTH",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -1,
                to: -1,
                granularity: "GDC.time.month",
                localIdentifier: "LAST_MONTH",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -11,
                to: 0,
                granularity: "GDC.time.month",
                localIdentifier: "LAST_12_MONTHS",
                type: "relativePreset",
                visible: true,
                name: "",
            },
        ],
        "GDC.time.quarter": [
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.quarter",
                localIdentifier: "THIS_QUARTER",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -1,
                to: -1,
                granularity: "GDC.time.quarter",
                localIdentifier: "LAST_QUARTER",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -3,
                to: 0,
                granularity: "GDC.time.quarter",
                localIdentifier: "LAST_4_QUARTERS",
                type: "relativePreset",
                visible: true,
                name: "",
            },
        ],
        "GDC.time.year": [
            {
                from: 0,
                to: 0,
                granularity: "GDC.time.year",
                localIdentifier: "THIS_YEAR",
                type: "relativePreset",
                visible: true,
                name: "",
            },
            {
                from: -1,
                to: -1,
                granularity: "GDC.time.year",
                localIdentifier: "LAST_YEAR",
                type: "relativePreset",
                visible: true,
                name: "",
            },
        ],
    },
};

const availableGranularities: ExtendedDateFilters.DateFilterGranularity[] = [
    "GDC.time.month",
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.date",
];

const defaultProps: IDateFilterProps = {
    excludeCurrentPeriod: false,
    selectedFilterOption: defaultDateFilterOptions.allTime,
    filterOptions: defaultDateFilterOptions,
    availableGranularities,
    isEditMode: false,
    customFilterName: "Filter name",
    dateFilterMode: "active",
    onApply: noop,
    onCancel: noop,
    onOpen: noop,
    onClose: noop,
};

const dateFilterButton = ".s-date-filter-button";
const dateButtonFilterTitle = ".s-date-filter-title";
const dateFilterButtonText = ".s-button-text";
const dateFilterSelectedItem = ".gd-filter-list-item-selected";

const applyButton = "button.s-date-filter-apply";
const cancelButton = "button.s-date-filter-cancel";

const dateFilterBody = ".s-extended-date-filters-body";

const excludeCurrentPeriodCheckbox = ".s-exclude-current-period input";

const allTimeButton = "button.s-all-time";

const absoluteFormButton = "button.s-absolute-form";
const absoluteFormPicker = ".s-date-range-picker";
const absoluteFormInputFrom = ".s-date-range-picker-from .s-date-range-picker-input-field";
const absoluteFormInputTo = ".s-date-range-picker-to .s-date-range-picker-input-field";
const absoluteFormError = ".s-absolute-range-error";
const absoluteCalendarFrom = ".s-date-range-calendar-from";
const absoluteCalendarTo = ".s-date-range-calendar-to";

const relativeFormButton = "button.s-relative-form";
const relativeFormPicker = ".s-relative-range-picker";
const relativeFormSelectMenu = ".s-select-menu";
const relativeFormInputFrom = ".s-relative-range-picker-from input";
const relativeFormInputTo = ".s-relative-range-picker-to input";
const relativeFormGranularityTab = (intlGranularity: string) => `.gd-tab.s-granularity-${intlGranularity}`;

export const createDateFilter = (customProps: Partial<IDateFilterProps> = {}) => {
    const props: IDateFilterProps = { ...defaultProps, ...customProps };

    return mount(<DateFilter {...props} />);
};

// common wrapper methods

export type WrapperType = ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>;

export const clickDateFilterButton = (wrapper: WrapperType) => {
    wrapper.find(dateFilterButton).simulate("click");
};

export const clickApplyButton = (wrapper: WrapperType) => {
    wrapper.find(applyButton).simulate("click");
    wrapper.update();
};

export const isApplyButtonDisabled = (wrapper: WrapperType) => {
    return wrapper.find(applyButton).hasClass("disabled");
};

export const clickCancelButton = (wrapper: WrapperType) => {
    wrapper.find(cancelButton).simulate("click");
    wrapper.update();
};

export const getDateFilterButtonText = (wrapper: WrapperType) => {
    const text = wrapper.find(dateFilterButtonText);
    return text.text();
};

export const setPropsFromOnApply = (
    wrapper: WrapperType,
    onApply: jest.Mock<any, any>,
    indexOfCall: number,
) => {
    const selectedFilterOption = onApply.mock.calls[indexOfCall][0];
    const excludeCurrentPeriod = onApply.mock.calls[indexOfCall][1];
    wrapper.setProps({ selectedFilterOption, excludeCurrentPeriod });
};

// config

export const getFilterTitle = (wrapper: WrapperType) => {
    const text = wrapper.find(dateButtonFilterTitle);
    return text.text();
};

export const getFilterMode = (wrapper: WrapperType) => {
    const text = wrapper.find(dateButtonFilterTitle);
    return text.text();
};

export const isDateFilterBodyVisible = (wrapper: WrapperType) => {
    const body = wrapper.find(dateFilterBody);
    return body.exists();
};

export const isDateFilterVisible = (wrapper: WrapperType) => {
    const body = wrapper.find(dateFilterButton);
    return body.exists();
};

export const getSelectedItemText = (wrapper: WrapperType) => {
    const item = wrapper.find(dateFilterSelectedItem);
    return item.text();
};

// relative presets

export const getLocalIdentifierFromItem = (item: string) => {
    return item.toUpperCase().replace(new RegExp("-", "g"), "_");
};

export const getPresetByItem = (item: string, relativePreset: any[]) => {
    const localIdentifier = getLocalIdentifierFromItem(item);
    return relativePreset.find(x => {
        return x.localIdentifier === localIdentifier.toUpperCase();
    });
};

export const getStaticFilterSelectorClass = (filter: string) => {
    return `button.s-relative-preset-${filter}`;
};

export const getAbsoluteFilterSelectorClass = (filter: string) => {
    return `button.s-absolute-preset-${filter}`;
};

export const clickAllTime = (wrapper: WrapperType) => {
    wrapper.find(allTimeButton).simulate("click");
};

export const clickStaticFilter = (wrapper: WrapperType, filter: string) => {
    const filterSelector = getStaticFilterSelectorClass(filter);
    wrapper.find(filterSelector).simulate("click");
};

export const getAllStaticItemsLabels = (wrapper: WrapperType): string[] => {
    const staticItems = wrapper
        .find("button.gd-filter-list-item")
        .filterWhere(item => item.html().includes("s-relative-preset-"));
    return staticItems.map(x => x.text());
};

// absolute presets
export const clickAbsoluteFilter = (wrapper: WrapperType, filter: string) => {
    const filterSelector = getAbsoluteFilterSelectorClass(filter);
    wrapper.find(filterSelector).simulate("click");
};

// Absolute filter form
export const clickAbsoluteFormFilter = (wrapper: WrapperType) => {
    wrapper.find(absoluteFormButton).simulate("click");
};

export const openAbsoluteFormFilter = (wrapper: WrapperType) => {
    clickDateFilterButton(wrapper);
    clickAbsoluteFormFilter(wrapper);
};

export const isAbsoluteFormVisible = (wrapper: WrapperType) => {
    const picker = wrapper.find(absoluteFormPicker);
    return picker.exists();
};

export const dateToAbsoluteInputFormat = (dateString: string | moment.Moment) => {
    return moment(dateString).format("MM/DD/YYYY");
};

export const getAbsoluteFormInputFromValue = (wrapper: WrapperType) => {
    const input = wrapper.find(absoluteFormInputFrom);
    return input.prop("value");
};

export const writeToAbsoluteFormInputFrom = (wrapper: WrapperType, value: string) => {
    const input = wrapper.find(absoluteFormInputFrom);
    input.simulate("change", { target: { value } });
};

export const getAbsoluteFormInputToValue = (wrapper: WrapperType) => {
    const input = wrapper.find(absoluteFormInputTo);
    return input.prop("value");
};

export const writeToAbsoluteFormInputTo = (wrapper: WrapperType, value: string) => {
    const input = wrapper.find(absoluteFormInputTo);
    input.simulate("change", { target: { value } });
};

export const getTodayDate = () => {
    return moment(new Date());
};

export const getMonthAgo = () => {
    return moment(new Date()).add(-1, "month");
};

export const isAbsoluteFormErrorVisible = (wrapper: WrapperType) => {
    return wrapper.find(absoluteFormError).exists();
};

export const isAbsoluteCalendarFromVisible = (wrapper: WrapperType) => {
    wrapper.update();
    return wrapper.find(absoluteCalendarFrom).exists();
};

export const isAbsoluteCalendarToVisible = (wrapper: WrapperType) => {
    wrapper.update();
    return wrapper.find(absoluteCalendarTo).exists();
};

export const clickAbsoluteFormInputFrom = (wrapper: WrapperType) => {
    wrapper.find(absoluteFormInputFrom).simulate("click");
};

export const clickAbsoluteFormInputTo = (wrapper: WrapperType) => {
    wrapper.find(absoluteFormInputTo).simulate("click");
};

// Relative filter form
export const clickRelativeFormFilter = (wrapper: WrapperType) => {
    wrapper.find(relativeFormButton).simulate("click");
};

export const openRelativeFormFilter = (wrapper: WrapperType) => {
    clickDateFilterButton(wrapper);
    clickRelativeFormFilter(wrapper);
};

export const getRelativeFormInputFromValue = (wrapper: WrapperType) => {
    const input = wrapper.find(relativeFormInputFrom);
    return input.prop("value");
};

export const getRelativeFormInputToValue = (wrapper: WrapperType) => {
    const input = wrapper.find(relativeFormInputTo);
    return input.prop("value");
};

export const setRelativeFormInputs = (wrapper: WrapperType, from: string, to: string) => {
    // it is necessary set value TO first and than FROM because strange menu opening in RelativeDateFilter copoment
    // if FROM is set first than in TO is problem to select menu item  (is not visible)
    writeToRelativeFormInputTo(wrapper, to);
    writeToRelativeFormInputFrom(wrapper, from);
};

const writeToRelativeFormInputTo = (wrapper: WrapperType, value: string) => {
    const input = wrapper.find(relativeFormInputTo);
    input.simulate("change", { target: { value } });

    const menuItem = wrapper.find(".s-select-item-focused");
    menuItem.simulate("click");
};

const writeToRelativeFormInputFrom = (wrapper: WrapperType, value: string) => {
    const input = wrapper.find(relativeFormInputFrom);
    input.simulate("change", { target: { value } });

    const menuItem = wrapper.find(".s-select-item-focused");
    menuItem.simulate("click");
};

export const clickRelativeFormGranularity = (wrapper: WrapperType, granularity: string) => {
    const tab = wrapper.find(relativeFormGranularityTab(granularity));
    tab.simulate("click");
};

export const isRelativeFormGranularitySelected = (wrapper: WrapperType, granularity: string) => {
    const tab = wrapper.find(relativeFormGranularityTab(granularity));
    return tab.hasClass("is-active");
};

export const isRelativeFormVisible = (wrapper: WrapperType) => {
    return wrapper.find(relativeFormPicker).exists();
};

export const isRelativeFormSelectMenuVisible = (wrapper: WrapperType) => {
    return wrapper.find(relativeFormSelectMenu).exists();
};

// exclude

export const isExcludeCurrentPeriodEnabled = (wrapper: WrapperType) => {
    const checkBox = wrapper.find(excludeCurrentPeriodCheckbox);
    return !checkBox.prop("disabled");
};

export const setExcludeCurrentPeriodCheckBox = (wrapper: WrapperType, value: boolean) => {
    wrapper.find(excludeCurrentPeriodCheckbox).simulate("change", { target: { checked: value } });
};

export const isExcludeCurrentPeriodChecked = (wrapper: WrapperType) => {
    const checkBox = wrapper.find(excludeCurrentPeriodCheckbox);
    return checkBox.prop("checked");
};
