// (C) 2019-2025 GoodData Corporation
import { describe, expect, it, vi } from "vitest";

import { suppressConsole } from "@gooddata/util";

import { AbsoluteForm } from "./AbsoluteForm.js";
import {
    clickAbsoluteFilter,
    clickAbsoluteFormFilter,
    clickAllTime,
    clickApplyButton,
    clickCancelButton,
    clickConfigurationButton,
    clickDateFilterButton,
    clickExcludeCurrentPeriodCheckBox,
    clickRelativeFormFilter,
    clickRelativeFormGranularity,
    clickStaticFilter,
    createDateFilter,
    createDateFilterWithState,
    dateToAbsoluteInputFormat,
    defaultDateFilterOptions,
    getAllStaticItemsLabels,
    getDateFilterButtonText,
    getExcludeCurrentPeriodCheckbox,
    getFilterTitle,
    getMonthAgo,
    getPresetByItem,
    getRelativeFormInputFromValue,
    getRelativeFormInputToValue,
    getSelectedItemText,
    getTodayDate,
    isApplyButtonDisabled,
    isConfigurationButtonVisible,
    isDateFilterBodyVisible,
    isDateFilterVisible,
    isExcludeCurrentPeriodChecked,
    isRelativeFormGranularitySelected,
    isRelativeFormSelectMenuVisible,
    isRelativeFormVisible,
    openAbsoluteFormFilter,
    openRelativeFormFilter,
    setRelativeFormInputs,
} from "./extendedDateFilters_helpers.js";
import { DEFAULT_DATE_FORMAT } from "../constants/Platform.js";
import { verifyDateFormat } from "../DateFilterCore.js";

describe("DateFilter", () => {
    it("should render without crash", () => {
        createDateFilter();
    });

    it("should render with custom name", () => {
        const expectedLabel = "Custom filter name";
        createDateFilter({ customFilterName: expectedLabel });
        expect(getFilterTitle()).toEqual(expectedLabel);
    });

    it("should render readonly", () => {
        createDateFilter({ dateFilterMode: "readonly" });
        clickDateFilterButton();
        expect(isDateFilterBodyVisible()).toBe(false);
        expect(isConfigurationButtonVisible()).toBe(false);
    });

    it("should render hidden", () => {
        createDateFilter({ dateFilterMode: "hidden" });
        expect(isDateFilterVisible()).toBe(false);
    });

    describe("configuration", () => {
        it("should render configuration button", () => {
            const MockConfigComponent = vi.fn();
            createDateFilter({
                FilterConfigurationComponent: MockConfigComponent,
            });
            clickDateFilterButton();
            expect(isConfigurationButtonVisible()).toBe(true);
            clickConfigurationButton();
            expect(MockConfigComponent).toHaveBeenCalled();
        });

        it("should not render configuration button", () => {
            createDateFilter({
                FilterConfigurationComponent: undefined,
            });
            clickDateFilterButton();
            expect(isConfigurationButtonVisible()).toBe(false);
        });
    });

    describe("cancel button", () => {
        it("should close DateFilter", () => {
            const onCancel = vi.fn();
            createDateFilter({ onCancel });
            clickDateFilterButton();
            clickCancelButton();

            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(isDateFilterBodyVisible()).toBe(false);
        });

        it("should not call onApply", () => {
            const onApply = vi.fn();
            createDateFilter({ onApply });
            clickDateFilterButton();
            clickStaticFilter("last-7-days");
            clickCancelButton();

            expect(onApply).toHaveBeenCalledTimes(0);
            expect(isDateFilterBodyVisible()).toBe(false);
        });

        it("should reset absolute filter form contents", () => {
            createDateFilter();
            openAbsoluteFormFilter();

            const absoluteForm = new AbsoluteForm();
            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2017-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2018-01-01"));
            clickCancelButton();

            openAbsoluteFormFilter();

            const today = getTodayDate();
            const monthAgo = getMonthAgo();

            expect(absoluteForm.getStartDate()).toEqual(dateToAbsoluteInputFormat(monthAgo));
            expect(absoluteForm.getEndDate()).toEqual(dateToAbsoluteInputFormat(today));
        });

        it("should reset relative filter contents", () => {
            createDateFilter();
            openRelativeFormFilter();

            setRelativeFormInputs("-2", "2");

            clickCancelButton();

            openRelativeFormFilter();

            expect(getRelativeFormInputFromValue()).toEqual("");
            expect(getRelativeFormInputToValue()).toEqual("");
        });
    });

    describe("reopening", () => {
        it("should keep all time selected when reopening", () => {
            const onApply = vi.fn();
            createDateFilter({ onApply });

            clickDateFilterButton();
            clickAllTime();
            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("All time");

            clickDateFilterButton();

            expect(getSelectedItemText()).toEqual("All time");
        });

        it("should keep relative preset selected when reopening", () => {
            const onApply = vi.fn();
            createDateFilterWithState({ onApply });

            clickDateFilterButton();
            clickStaticFilter("last-month");
            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("Last month");

            clickDateFilterButton();

            expect(getSelectedItemText()).toEqual("Last month");
        });

        it("should keep absolute form selected and filled when reopening", () => {
            const fromInputValue = dateToAbsoluteInputFormat("2017-01-01");
            const toInputValue = dateToAbsoluteInputFormat("2018-01-01");

            const onApply = vi.fn();
            createDateFilterWithState({ onApply });

            openAbsoluteFormFilter();

            const absoluteForm = new AbsoluteForm();
            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);
            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("01/01/2017 – 01/01/2018");

            clickDateFilterButton();

            expect(getSelectedItemText()).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
        });

        it("should keep relative form selected and filled when reopening", () => {
            const onApply = vi.fn();
            createDateFilterWithState({ onApply });

            openRelativeFormFilter();
            clickRelativeFormGranularity("year");

            setRelativeFormInputs("-2", "2");

            clickApplyButton();
            expect(onApply).toHaveBeenCalledTimes(1);

            clickDateFilterButton();
            expect(isRelativeFormGranularitySelected("year")).toBe(true);
            expect(getSelectedItemText()).toEqual("Relative period");
            expect(getRelativeFormInputFromValue()).toEqual("2 years ago");
            expect(getRelativeFormInputToValue()).toEqual("2 years ahead");
        });
    });

    describe("exclude option", () => {
        it("should be disabled when 'All time' selected", () => {
            createDateFilter();
            clickDateFilterButton();
            expect(getExcludeCurrentPeriodCheckbox()).toBeDisabled();
        });

        it("should be enabled when last 12 months", () => {
            createDateFilter();
            clickDateFilterButton();
            clickStaticFilter("last-12-months");
            expect(getExcludeCurrentPeriodCheckbox()).not.toBeDisabled();
        });

        it("should be disabled when last month", () => {
            createDateFilter();
            clickDateFilterButton();
            clickStaticFilter("last-month");
            expect(getExcludeCurrentPeriodCheckbox()).toBeDisabled();
        });

        it("should be disabled when viewing entire year", () => {
            createDateFilter();
            clickDateFilterButton();
            clickStaticFilter("this-year");
            expect(getExcludeCurrentPeriodCheckbox()).toBeDisabled();
        });

        it("should be disabled for relative date selection", () => {
            createDateFilter();
            openRelativeFormFilter();
            expect(getExcludeCurrentPeriodCheckbox()).toBeDisabled();
        });

        it("should be disabled for absolute form", () => {
            createDateFilter();
            openAbsoluteFormFilter();
            expect(getExcludeCurrentPeriodCheckbox()).toBeDisabled();
        });

        it("should stay checked when switching between options where it is valid", () => {
            createDateFilter();
            clickDateFilterButton();
            clickStaticFilter("last-12-months");
            clickExcludeCurrentPeriodCheckBox();
            expect(isExcludeCurrentPeriodChecked()).toBe(true);
            clickStaticFilter("last-7-days");
            expect(isExcludeCurrentPeriodChecked()).toBe(true);
        });

        it("should be unchecked when switching to option where it is no longer valid", () => {
            createDateFilter();
            clickDateFilterButton();
            clickStaticFilter("last-12-months");
            clickExcludeCurrentPeriodCheckBox();
            expect(isExcludeCurrentPeriodChecked()).toBe(true);
            clickStaticFilter("last-month");
            expect(isExcludeCurrentPeriodChecked()).toBe(false);
        });

        it("should use adjusted period as a title when exclude is on", () => {
            const onApply = vi.fn();
            createDateFilterWithState({ onApply });
            clickDateFilterButton();
            clickStaticFilter("last-12-months");
            clickExcludeCurrentPeriodCheckBox();
            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("From 12 to 1 month ago");
        });

        it("should use original period title when exclude is off", () => {
            const onApply = vi.fn();
            createDateFilterWithState({ onApply });
            clickDateFilterButton();
            clickStaticFilter("last-12-months");
            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("Last 12 months");
        });
    });

    describe("relative presets", () => {
        it.each([
            ["last-7-days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["last-30-days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["last-90-days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["this-month", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["last-month", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["last-12-months", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["this-quarter", defaultDateFilterOptions.relativePreset["GDC.time.quarter"]],
            ["last-quarter", defaultDateFilterOptions.relativePreset["GDC.time.quarter"]],
            ["last-4-quarters", defaultDateFilterOptions.relativePreset["GDC.time.quarter"]],
            ["this-year", defaultDateFilterOptions.relativePreset["GDC.time.year"]],
            ["last-year", defaultDateFilterOptions.relativePreset["GDC.time.year"]],
        ])("should switch to static date filter with %s", (item: string, relativePreset: any[]) => {
            const onApply = vi.fn();
            createDateFilter({ onApply });

            clickDateFilterButton();
            clickStaticFilter(item);
            clickApplyButton();

            const expectedSelectedItem = getPresetByItem(item, relativePreset);

            expect(onApply).toHaveBeenCalledTimes(1);
            expect(onApply).toBeCalledWith(expectedSelectedItem, false);
        });

        it.each([
            ["last-7-days", "Last 7 days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["last-30-days", "Last 30 days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["last-90-days", "Last 90 days", defaultDateFilterOptions.relativePreset["GDC.time.date"]],
            ["this-month", "This month", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["last-month", "Last month", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["last-12-months", "Last 12 months", defaultDateFilterOptions.relativePreset["GDC.time.month"]],
            ["this-quarter", "This quarter", defaultDateFilterOptions.relativePreset["GDC.time.quarter"]],
            ["last-quarter", "Last quarter", defaultDateFilterOptions.relativePreset["GDC.time.quarter"]],
            [
                "last-4-quarters",
                "Last 4 quarters",
                defaultDateFilterOptions.relativePreset["GDC.time.quarter"],
            ],
            ["this-year", "This year", defaultDateFilterOptions.relativePreset["GDC.time.year"]],
            ["last-year", "Last year", defaultDateFilterOptions.relativePreset["GDC.time.year"]],
        ])("should set correct button label %s", (item: string, label: string, relativePreset: any[]) => {
            const selectedFilterOption = getPresetByItem(item, relativePreset);
            createDateFilter({ selectedFilterOption });
            expect(getDateFilterButtonText()).toBe(label);
        });

        it("should sort static filters in ASC order", () => {
            const expectedItems = [
                "This year",
                "Last year",
                "This quarter",
                "Last quarter",
                "Last 4 quarters",
                "This month",
                "Last month",
                "Last 12 months",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
            ];

            createDateFilter();
            clickDateFilterButton();
            const staticItems = getAllStaticItemsLabels();
            expect(staticItems).toEqual(expectedItems);
        });
    });

    describe("absolute presets", () => {
        it.each([["christmas-2019"], ["year-2018"]])(
            "should switch static date filter to %s",
            (item: string) => {
                const onApply = vi.fn();
                createDateFilter({ onApply });

                clickDateFilterButton();

                clickAbsoluteFilter(item);
                clickApplyButton();

                const expectedSelectedItem = getPresetByItem(item, defaultDateFilterOptions.absolutePreset);

                expect(onApply).toHaveBeenCalledTimes(1);
                expect(onApply).toBeCalledWith(expectedSelectedItem, false);
            },
        );
    });

    describe("absolute form", () => {
        it("should open", () => {
            createDateFilter();

            const absoluteForm = new AbsoluteForm();
            expect(absoluteForm.isVisible()).toBe(false);
            clickDateFilterButton();
            expect(absoluteForm.isVisible()).toBe(false);
            clickAbsoluteFormFilter();
            expect(absoluteForm.isVisible()).toBe(true);
            clickAllTime();
            expect(absoluteForm.isVisible()).toBe(false);
        });

        it("should set correct values into input", () => {
            const onApply = vi.fn();
            createDateFilterWithState({ onApply });

            const from = "2019-10-15";
            const to = "2019-10-25";
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            const absoluteForm = new AbsoluteForm();
            absoluteForm.setStartDate(dateToAbsoluteInputFormat(from));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat(to));

            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("10/15/2019 – 10/25/2019");
        });

        it("should set correct values with desired format", () => {
            const dateFormat = "yyyy/MM/dd";
            const onApply = vi.fn();
            createDateFilterWithState({
                dateFormat,
                onApply,
            });
            const absoluteForm = new AbsoluteForm();

            const from = "2019-10-15";
            const to = "2019-10-25";
            clickDateFilterButton();
            clickAbsoluteFormFilter();
            absoluteForm.setStartDate(dateToAbsoluteInputFormat(from, dateFormat));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat(to, dateFormat));

            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("2019/10/15 – 2019/10/25");
        });

        it("should use the default date format MM/dd/yyyy if the input date format is invalid", () => {
            const dateFormat = "ffff";
            const verifiedDateFormat = suppressConsole(() => verifyDateFormat(dateFormat), "warn", [
                {
                    type: "exact",
                    value: `Unsupported date format ${dateFormat}, the default format MM/dd/yyyy is used instead.`,
                },
            ]);
            expect(verifiedDateFormat).toEqual(DEFAULT_DATE_FORMAT);
        });

        it("should render Absolute date filter with no errors when it is opened", () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();
            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled()).toBe(false);
        });

        it.each([
            ["invalid value", "xxx"],
            ["unknown format", "2019-10-10"],
            ["invalid day", "12/32/2019"],
            ["day as zero", "12/0/2019"],
            ["long year", "12/01/2019999"],
        ])("should show error when %s is entered to fromInput", (_lablel: string, value: string) => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();
            absoluteForm.setStartDate(value);
            expect(absoluteForm.isErrorVisible()).toBe(true);
        });

        it.each([
            ["invalid value", "xxx"],
            ["unknown format", "2019-10-10"],
            ["invalid day", "12/32/2019"],
            ["day as zero", "12/0/2019"],
            ["long year", "12/01/2019999"],
        ])("should show error when %s is entered to toInput", (_lablel: string, value: string) => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();
            absoluteForm.setEndDate(value);
            expect(absoluteForm.isErrorVisible()).toBe(true);
        });

        it("should show errors with more complex interaction", () => {
            const from = "2019-01-01";
            const to = "2019-12-31";

            const onApply = vi.fn();
            createDateFilterWithState({ onApply });
            const absoluteForm = new AbsoluteForm();

            clickDateFilterButton();
            clickAbsoluteFormFilter();
            expect(absoluteForm.isErrorVisible()).toBe(false);

            absoluteForm.setStartDate("xxx");
            expect(absoluteForm.isErrorVisible()).toBe(true);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat(from));
            expect(absoluteForm.isErrorVisible()).toBe(false);

            absoluteForm.setEndDate("10/10/2019");
            expect(absoluteForm.isErrorVisible()).toBe(false);

            absoluteForm.setEndDate("xxx");
            expect(absoluteForm.isErrorVisible()).toBe(true);

            absoluteForm.setEndDate(dateToAbsoluteInputFormat(to));
            expect(absoluteForm.isErrorVisible()).toBe(false);
            clickApplyButton();
            expect(getDateFilterButtonText()).toEqual("01/01/2019 – 12/31/2019");
        });

        it("should set default value from last month to current month", () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            const expectedFrom = dateToAbsoluteInputFormat(getMonthAgo());
            const expectedTo = dateToAbsoluteInputFormat(getTodayDate());
            expect(absoluteForm.getStartDate()).toEqual(expectedFrom);
            expect(absoluteForm.getEndDate()).toEqual(expectedTo);
        });

        it("should not have errors with valid input", () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-31"));
            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled()).toBe(false);
        });

        it('should display error message when "Start" is later than "End" value and start is set twice', () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-31"));
            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-05-01"));

            expect(absoluteForm.getStartDate()).toEqual("05/01/2019");
            expect(absoluteForm.getEndDate()).toEqual("01/31/2019");
            expect(absoluteForm.isErrorVisible()).toBe(true);
            expect(isApplyButtonDisabled()).toBe(true);
        });

        it('should display error message when "Start" is later than "End" value', () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-31"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-01"));

            expect(absoluteForm.getStartDate()).toEqual("01/31/2019");
            expect(absoluteForm.getEndDate()).toEqual("01/01/2019");
            expect(absoluteForm.isErrorVisible()).toBe(true);
            expect(isApplyButtonDisabled()).toBe(true);
        });

        it('should not have errors when "from" = "to"', () => {
            createDateFilter();
            const absoluteForm = new AbsoluteForm();
            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-01"));

            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled()).toBe(false);
        });
    });

    describe("relative form", () => {
        it("should open", () => {
            createDateFilter();
            clickDateFilterButton();
            expect(isRelativeFormVisible()).toBe(false);
            clickRelativeFormFilter();
            expect(isRelativeFormVisible()).toBe(true);
            clickAllTime();
            expect(isRelativeFormVisible()).toBe(false);
        });

        it("should have select menu closed by default", async () => {
            createDateFilter();
            clickDateFilterButton();
            clickRelativeFormFilter();
            expect(isRelativeFormSelectMenuVisible()).toBe(false);
        });

        it("should have default granularity months", async () => {
            createDateFilter();
            clickDateFilterButton();
            clickRelativeFormFilter();
            expect(isRelativeFormGranularitySelected("month")).toBe(true);
        });

        it("should clear the form when Granularity changed", async () => {
            createDateFilter();
            clickDateFilterButton();
            clickRelativeFormFilter();

            clickRelativeFormGranularity("month");

            setRelativeFormInputs("-2", "2");

            expect(getRelativeFormInputFromValue()).toEqual("2 months ago");

            clickRelativeFormGranularity("year");

            expect(getRelativeFormInputFromValue()).toEqual("");
        });
    });

    describe("Absolute form with enabled time", () => {
        const dateFormat = "yyyy/MM/dd";
        const fromInputValue = dateToAbsoluteInputFormat("2019-10-15", dateFormat);
        const toInputValue = dateToAbsoluteInputFormat("2019-10-25", dateFormat);
        const isTimeForAbsoluteRangeEnabled = true;

        it("should set correct values with desired format", () => {
            const onApply = vi.fn();
            createDateFilterWithState({
                dateFormat,
                onApply,
                isTimeForAbsoluteRangeEnabled,
            });
            const absoluteForm = new AbsoluteForm();
            const fromTime = "10:00";
            const toTime = "14:00";

            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);
            absoluteForm.setStartTime(fromTime);
            absoluteForm.setEndTime(toTime);

            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("2019/10/15, 10:00 – 2019/10/25, 14:00");

            clickDateFilterButton();

            expect(getSelectedItemText()).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
            expect(absoluteForm.getStartTime()).toEqual(fromTime);
            expect(absoluteForm.getEndTime()).toEqual(toTime);
        });

        it("should get default time values if not configured", () => {
            const onApply = vi.fn();
            createDateFilterWithState({
                dateFormat,
                onApply,
                isTimeForAbsoluteRangeEnabled,
            });
            const absoluteForm = new AbsoluteForm();

            clickDateFilterButton();
            clickAbsoluteFormFilter();

            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);

            clickApplyButton();

            expect(getDateFilterButtonText()).toEqual("2019/10/15 – 2019/10/25");

            clickDateFilterButton();

            expect(getSelectedItemText()).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
            expect(absoluteForm.getStartTime()).toEqual("00:00");
            expect(absoluteForm.getEndTime()).toEqual("23:59");
        });
    });
});
