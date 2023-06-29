// (C) 2007-2023 GoodData Corporation
import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { platformDateFormat } from "../constants/Platform.js";
import moment from "moment";
import addDate from "date-fns/add/index.js";
import formatDate from "date-fns/format/index.js";
import noop from "lodash/noop.js";
import { IDateFilterProps, DateFilter } from "../DateFilter.js";
import { DateFilterOption, IDateFilterOptionsByType } from "../interfaces/index.js";
import { DateFilterGranularity } from "@gooddata/sdk-model";

export const defaultDateFilterOptions: IDateFilterOptionsByType = {
    allTime: {
        localIdentifier: "ALL_TIME",
        type: "allTime",
        name: "",
        visible: true,
    },
    absoluteForm: {
        localIdentifier: "ABSOLUTE_FORM",
        type: "absoluteForm",
        from: moment().subtract(1, "month").startOf("day").format(platformDateFormat),
        to: moment().startOf("day").format(platformDateFormat),
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

const availableGranularities: DateFilterGranularity[] = [
    "GDC.time.month",
    "GDC.time.year",
    "GDC.time.quarter",
    "GDC.time.date",
    "GDC.time.hour",
    "GDC.time.minute",
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

const dateFilterBody = ".s-extended-date-filters-body";

const excludeCurrentPeriodCheckbox = ".s-exclude-current-period input";

const allTimeButton = "button.s-all-time";

const absoluteFormButton = "button.s-absolute-form";

const relativeFormButton = "button.s-relative-form";
const relativeFormPicker = ".s-relative-range-picker";
const relativeFormSelectMenu = ".s-select-menu";
const relativeFormInputFrom = ".s-relative-range-picker-from input";
const relativeFormInputTo = ".s-relative-range-picker-to input";
const relativeFormGranularityTab = (intlGranularity: string) => `.gd-tab.s-granularity-${intlGranularity}`;

const defaultDateFormat: string = "MM/dd/yyyy";

export const createDateFilter = (customProps: Partial<IDateFilterProps> = {}) => {
    const props: IDateFilterProps = { ...defaultProps, ...customProps };

    return render(<DateFilter {...props} />);
};

/**
 * Use this component renderer if you need to check some state changes regarding apply handler
 */
export const createDateFilterWithState = (customProps: Partial<IDateFilterProps> = {}) => {
    const props: IDateFilterProps = { ...defaultProps, ...customProps };

    return render(<DateFilterWithState {...props} />);
};

export const DateFilterWithState = (customProps: Partial<IDateFilterProps> = {}) => {
    const [selectedFilterOption, setSelectedFilterOption] = useState(
        customProps.selectedFilterOption ?? defaultProps.selectedFilterOption,
    );
    const [excludeCurrentPeriod, setExcludeCurrentPeriod] = useState(
        customProps.excludeCurrentPeriod ?? defaultProps.excludeCurrentPeriod,
    );
    const handleApply = (selectedFilterOption: DateFilterOption, excludeCurrentPeriod: boolean) => {
        setSelectedFilterOption(selectedFilterOption);
        setExcludeCurrentPeriod(excludeCurrentPeriod);
        customProps.onApply?.(selectedFilterOption, excludeCurrentPeriod);
    };

    return (
        <DateFilter
            {...defaultProps}
            {...customProps}
            selectedFilterOption={selectedFilterOption}
            excludeCurrentPeriod={excludeCurrentPeriod}
            onApply={handleApply}
        />
    );
};

// common methods

export const clickDateFilterButton = () => fireEvent.click(document.querySelector(dateFilterButton));

const getApplyButton = () => screen.getByText("Apply");

export const clickApplyButton = () => fireEvent.click(getApplyButton());

export const isApplyButtonDisabled = () => getApplyButton().parentElement.classList.contains("disabled");

export const clickCancelButton = () => fireEvent.click(screen.getByText("Cancel"));

export const getDateFilterButtonText = () => document.querySelector(dateFilterButtonText).textContent;

// config

export const getFilterTitle = () => document.querySelector(dateButtonFilterTitle).textContent;

export const isDateFilterBodyVisible = () => !!document.querySelector(dateFilterBody);

export const isDateFilterVisible = () => !!document.querySelector(dateFilterButton);

export const getSelectedItemText = () => document.querySelector(dateFilterSelectedItem).textContent;

// relative presets

const getLocalIdentifierFromItem = (item: string) => {
    return item.toUpperCase().replace(/-/g, "_");
};

export const getPresetByItem = (item: string, relativePreset: any[]) => {
    const localIdentifier = getLocalIdentifierFromItem(item);
    return relativePreset.find((x) => {
        return x.localIdentifier === localIdentifier.toUpperCase();
    });
};

const getStaticFilterSelectorClass = (filter: string) => {
    return `button.s-relative-preset-${filter}`;
};

const getAbsoluteFilterSelectorClass = (filter: string) => {
    return `button.s-absolute-preset-${filter}`;
};

export const clickAllTime = () => fireEvent.click(document.querySelector(allTimeButton));

export const clickStaticFilter = (filter: string) => {
    const filterSelector = getStaticFilterSelectorClass(filter);
    fireEvent.click(document.querySelector(filterSelector));
};

export const getAllStaticItemsLabels = (): string[] => {
    const labels: string[] = [];
    document
        .querySelectorAll("[class*='s-relative-preset-']")
        .forEach((item) => labels.push(item.textContent));
    return labels;
};

// absolute presets
export const clickAbsoluteFilter = (filter: string) => {
    const filterSelector = getAbsoluteFilterSelectorClass(filter);
    fireEvent.click(document.querySelector(filterSelector));
};

// Absolute filter form
export const clickAbsoluteFormFilter = () => fireEvent.click(document.querySelector(absoluteFormButton));

export const openAbsoluteFormFilter = () => {
    clickDateFilterButton();
    clickAbsoluteFormFilter();
};

export const dateToAbsoluteInputFormat = (dateString: string, dateFormat: string = defaultDateFormat) => {
    return formatDate(new Date(dateString), dateFormat);
};

export const getTodayDate = (dateFormat: string = defaultDateFormat) => {
    return formatDate(new Date(), dateFormat);
};

export const getMonthAgo = (dateFormat: string = defaultDateFormat) => {
    return formatDate(
        addDate(new Date(), {
            months: -1,
        }),
        dateFormat,
    );
};

// Relative filter form
export const clickRelativeFormFilter = () => {
    fireEvent.click(document.querySelector(relativeFormButton));
};

export const openRelativeFormFilter = () => {
    clickDateFilterButton();
    clickRelativeFormFilter();
};

export const getRelativeFormInputFromValue = () =>
    (document.querySelector(relativeFormInputFrom) as HTMLInputElement).value;

export const getRelativeFormInputToValue = () =>
    (document.querySelector(relativeFormInputTo) as HTMLInputElement).value;

export const setRelativeFormInputs = (from: string, to: string) => {
    // it is necessary set value TO first and than FROM because strange menu opening in RelativeDateFilter copoment
    // if FROM is set first than in TO is problem to select menu item  (is not visible)
    writeToRelativeFormInputTo(to);
    writeToRelativeFormInputFrom(from);
};

const writeToRelativeFormInputTo = (value: string) => {
    const input = document.querySelector(relativeFormInputTo);
    fireEvent.change(input, { target: { value } });

    const menuItem = document.querySelector(".s-select-item-focused");
    fireEvent.click(menuItem);
};

const writeToRelativeFormInputFrom = (value: string) => {
    const input = document.querySelector(relativeFormInputFrom);
    fireEvent.change(input, { target: { value } });

    const menuItem = document.querySelector(".s-select-item-focused");
    fireEvent.click(menuItem);
};

export const clickRelativeFormGranularity = (granularity: string) => {
    const tab = document.querySelector(relativeFormGranularityTab(granularity));
    fireEvent.click(tab);
};

export const isRelativeFormGranularitySelected = (granularity: string) => {
    const tab = document.querySelector(relativeFormGranularityTab(granularity));
    return tab.classList.contains("is-active");
};

export const isRelativeFormVisible = () => !!document.querySelector(relativeFormPicker);

export const isRelativeFormSelectMenuVisible = () => !!document.querySelector(relativeFormSelectMenu);

// exclude

export const getExcludeCurrentPeriodCheckbox = (): HTMLInputElement =>
    document.querySelector(excludeCurrentPeriodCheckbox);

export const clickExcludeCurrentPeriodCheckBox = () => {
    fireEvent.click(getExcludeCurrentPeriodCheckbox());
};

export const isExcludeCurrentPeriodChecked = () => getExcludeCurrentPeriodCheckbox().checked;
