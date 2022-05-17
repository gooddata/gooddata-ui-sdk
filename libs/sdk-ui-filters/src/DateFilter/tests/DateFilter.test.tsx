// (C) 2019-2022 GoodData Corporation
import {
    createDateFilter,
    clickDateFilterButton,
    clickStaticFilter,
    clickApplyButton,
    defaultDateFilterOptions,
    getPresetByItem,
    getDateFilterButtonText,
    getAllStaticItemsLabels,
    getFilterTitle,
    isDateFilterBodyVisible,
    isDateFilterVisible,
    clickCancelButton,
    dateToAbsoluteInputFormat,
    getTodayDate,
    getMonthAgo,
    openRelativeFormFilter,
    getRelativeFormInputFromValue,
    getRelativeFormInputToValue,
    isExcludeCurrentPeriodEnabled,
    setExcludeCurrentPeriodCheckBox,
    isExcludeCurrentPeriodChecked,
    clickAllTime,
    getSelectedItemText,
    setPropsFromOnApply,
    clickRelativeFormGranularity,
    isRelativeFormGranularitySelected,
    setRelativeFormInputs,
    clickAbsoluteFilter,
    isApplyButtonDisabled,
    isRelativeFormVisible,
    clickRelativeFormFilter,
    isRelativeFormSelectMenuVisible,
    openAbsoluteFormFilter,
    clickAbsoluteFormFilter,
} from "./extendedDateFilters_helpers";
import { AbsoluteForm } from "./AbsoluteForm";
import { DEFAULT_DATE_FORMAT } from "../constants/Platform";
import { verifyDateFormat } from "../DateFilterCore";

describe("DateFilter", () => {
    it("should render without crash", () => {
        createDateFilter();
    });

    it("should render with custom name", () => {
        const expectedLabel = "Custom filter name";
        const wrapper = createDateFilter({ customFilterName: expectedLabel });
        expect(getFilterTitle(wrapper)).toEqual(expectedLabel);
    });

    it("should render readonly", () => {
        const wrapper = createDateFilter({ dateFilterMode: "readonly" });
        clickDateFilterButton(wrapper);
        expect(isDateFilterBodyVisible(wrapper)).toBe(false);
    });

    it("should render hidden", () => {
        const wrapper = createDateFilter({ dateFilterMode: "hidden" });
        expect(isDateFilterVisible(wrapper)).toBe(false);
    });

    it("should update selectedFilterOption after first render", () => {
        const wrapper = createDateFilter();
        expect(getDateFilterButtonText(wrapper)).toBe("All time");

        const selectedFilterOption = getPresetByItem(
            "last-7-days",
            defaultDateFilterOptions.relativePreset["GDC.time.date"],
        );
        wrapper.setProps({ selectedFilterOption });
        expect(getDateFilterButtonText(wrapper)).toBe("Last 7 days");
    });

    describe("cancel button", () => {
        it("should close DateFilter", () => {
            const onCancel = jest.fn();
            const wrapper = createDateFilter({ onCancel });
            clickDateFilterButton(wrapper);
            clickCancelButton(wrapper);
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(isDateFilterBodyVisible(wrapper)).toBe(false);
        });

        it("should not call onApply", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-7-days");
            clickCancelButton(wrapper);

            expect(onApply).toHaveBeenCalledTimes(0);
            expect(isDateFilterBodyVisible(wrapper)).toBe(false);
        });

        it("should reset absolute filter form contents", () => {
            const wrapper = createDateFilter();
            openAbsoluteFormFilter(wrapper);

            const absoluteForm = new AbsoluteForm(wrapper);
            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2017-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2018-01-01"));
            clickCancelButton(wrapper);

            openAbsoluteFormFilter(wrapper);

            const today = getTodayDate();
            const monthAgo = getMonthAgo();

            expect(absoluteForm.getStartDate()).toEqual(dateToAbsoluteInputFormat(monthAgo));
            expect(absoluteForm.getEndDate()).toEqual(dateToAbsoluteInputFormat(today));
        });

        it("should reset relative filter contents", () => {
            const wrapper = createDateFilter();
            openRelativeFormFilter(wrapper);

            setRelativeFormInputs(wrapper, "-2", "2");

            clickCancelButton(wrapper);

            openRelativeFormFilter(wrapper);

            expect(getRelativeFormInputFromValue(wrapper)).toEqual("");
            expect(getRelativeFormInputToValue(wrapper)).toEqual("");
        });
    });

    describe("reopening", () => {
        it("should keep all time selected when reopening", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            clickDateFilterButton(wrapper);
            clickAllTime(wrapper);
            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("All time");

            clickDateFilterButton(wrapper);

            expect(getSelectedItemText(wrapper)).toEqual("All time");
        });

        it("should keep relative preset selected when reopening", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-month");
            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("Last month");

            clickDateFilterButton(wrapper);

            expect(getSelectedItemText(wrapper)).toEqual("Last month");
        });

        it("should keep absolute form selected and filled when reopening", () => {
            const fromInputValue = dateToAbsoluteInputFormat("2017-01-01");
            const toInputValue = dateToAbsoluteInputFormat("2018-01-01");

            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            openAbsoluteFormFilter(wrapper);

            const absoluteForm = new AbsoluteForm(wrapper);
            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);
            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("01/01/2017 – 01/01/2018");

            clickDateFilterButton(wrapper);

            expect(getSelectedItemText(wrapper)).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
        });

        it("should keep relative form selected and filled when reopening", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            openRelativeFormFilter(wrapper);
            clickRelativeFormGranularity(wrapper, "year");

            setRelativeFormInputs(wrapper, "-2", "2");

            clickApplyButton(wrapper);
            expect(onApply).toHaveBeenCalledTimes(1);
            setPropsFromOnApply(wrapper, onApply, 0);

            clickDateFilterButton(wrapper);
            expect(isRelativeFormGranularitySelected(wrapper, "year")).toBe(true);
            expect(getSelectedItemText(wrapper)).toEqual("Relative period");
            expect(getRelativeFormInputFromValue(wrapper)).toEqual("2 years ago");
            expect(getRelativeFormInputToValue(wrapper)).toEqual("2 years ahead");
        });
    });

    describe("exclude option", () => {
        it("should be disabled when 'All time' selected", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(false);
        });

        it("should be enabled when last 12 months", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-12-months");
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(true);
        });

        it("should be disabled when last month", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-month");
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(false);
        });

        it("should be disabled when viewing entire year", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "this-year");
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(false);
        });

        it("should be disabled for relative date selection", () => {
            const wrapper = createDateFilter();
            openRelativeFormFilter(wrapper);
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(false);
        });

        it("should be disabled for absolute form", () => {
            const wrapper = createDateFilter();
            openAbsoluteFormFilter(wrapper);
            expect(isExcludeCurrentPeriodEnabled(wrapper)).toBe(false);
        });

        it("should stay checked when switching between options where it is valid", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-12-months");
            setExcludeCurrentPeriodCheckBox(wrapper, true);
            expect(isExcludeCurrentPeriodChecked(wrapper)).toBe(true);
            clickStaticFilter(wrapper, "last-7-days");
            expect(isExcludeCurrentPeriodChecked(wrapper)).toBe(true);
        });

        it("should be unchecked when switching to option where it is no longer valid", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-12-months");
            setExcludeCurrentPeriodCheckBox(wrapper, true);
            expect(isExcludeCurrentPeriodChecked(wrapper)).toBe(true);
            clickStaticFilter(wrapper, "last-month");
            expect(isExcludeCurrentPeriodChecked(wrapper)).toBe(false);
        });

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
        ])(
            "should switch static date filter to %s when exclude is on",
            (item: string, relativePreset: any[]) => {
                const onApply = jest.fn();
                const wrapper = createDateFilter({ onApply });

                clickDateFilterButton(wrapper);
                clickStaticFilter(wrapper, item);
                setExcludeCurrentPeriodCheckBox(wrapper, true);
                expect(isExcludeCurrentPeriodChecked(wrapper)).toBe(true);
                clickApplyButton(wrapper);

                const expectedSelectedItem = getPresetByItem(item, relativePreset);
                expect(onApply).toHaveBeenCalledTimes(1);
                expect(onApply).toBeCalledWith(expectedSelectedItem, true);
            },
        );

        it("should use adjusted period as a title when exclude is on", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-12-months");
            setExcludeCurrentPeriodCheckBox(wrapper, true);
            clickApplyButton(wrapper);
            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("From 12 to 1 month ago");
        });

        it("should use original period title when exclude is off", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });
            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, "last-12-months");
            clickApplyButton(wrapper);
            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("Last 12 months");
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
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            clickDateFilterButton(wrapper);
            clickStaticFilter(wrapper, item);
            clickApplyButton(wrapper);

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
            const wrapper = createDateFilter({ selectedFilterOption });
            expect(getDateFilterButtonText(wrapper)).toBe(label);
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

            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            const staticItems = getAllStaticItemsLabels(wrapper);
            expect(staticItems).toEqual(expectedItems);
        });
    });

    describe("absolute presets", () => {
        it.each([["christmas-2019"], ["year-2018"]])(
            "should switch static date filter to %s",
            (item: string) => {
                const onApply = jest.fn();
                const wrapper = createDateFilter({ onApply });

                clickDateFilterButton(wrapper);

                clickAbsoluteFilter(wrapper, item);
                clickApplyButton(wrapper);

                const expectedSelectedItem = getPresetByItem(item, defaultDateFilterOptions.absolutePreset);

                expect(onApply).toHaveBeenCalledTimes(1);
                expect(onApply).toBeCalledWith(expectedSelectedItem, false);
            },
        );
    });

    describe("absolute form", () => {
        it("should open", () => {
            const wrapper = createDateFilter();

            const absoluteForm = new AbsoluteForm(wrapper);
            expect(absoluteForm.isVisible()).toBe(false);
            clickDateFilterButton(wrapper);
            expect(absoluteForm.isVisible()).toBe(false);
            clickAbsoluteFormFilter(wrapper);
            expect(absoluteForm.isVisible()).toBe(true);
            clickAllTime(wrapper);
            expect(absoluteForm.isVisible()).toBe(false);
        });

        it("should set correct values into input", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });

            const from = "2019-10-15";
            const to = "2019-10-25";
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            const absoluteForm = new AbsoluteForm(wrapper);
            absoluteForm.setStartDate(dateToAbsoluteInputFormat(from));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat(to));

            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("10/15/2019 – 10/25/2019");
        });

        it("should set correct values with desired format", () => {
            const dateFormat = "yyyy/MM/dd";
            const onApply = jest.fn();
            const wrapper = createDateFilter({
                dateFormat,
                onApply,
            });
            const absoluteForm = new AbsoluteForm(wrapper);

            const from = "2019-10-15";
            const to = "2019-10-25";
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat(from, dateFormat));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat(to, dateFormat));

            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("2019/10/15 – 2019/10/25");
        });

        it("should use the default date format MM/dd/yyyy if the input date format is invalid", () => {
            const dateFormat = "ffff";
            const verifiedDateFormat = verifyDateFormat(dateFormat);
            expect(verifiedDateFormat).toEqual(DEFAULT_DATE_FORMAT);
        });

        it("should render Absolute date filter with no errors when it is opened", () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);

            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);
            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled(wrapper)).toBe(false);
        });

        it.each([
            ["invalid value", "xxx"],
            ["unknown format", "2019-10-10"],
            ["invalid day", "12/32/2019"],
            ["day as zero", "12/0/2019"],
            ["long year", "12/01/2019999"],
        ])("should show error when %s is entered to fromInput", (_lablel: string, value: string) => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);
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
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);
            absoluteForm.setEndDate(value);
            expect(absoluteForm.isErrorVisible()).toBe(true);
        });

        it("should show errors with more complex interaction", () => {
            const from = "2019-01-01";
            const to = "2019-12-31";

            const onApply = jest.fn();
            const wrapper = createDateFilter({ onApply });
            const absoluteForm = new AbsoluteForm(wrapper);

            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

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

            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);
            expect(getDateFilterButtonText(wrapper)).toEqual("01/01/2019 – 12/31/2019");
        });

        it("should set default value from last month to current month", () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            const expectedFrom = dateToAbsoluteInputFormat(getMonthAgo());
            const expectedTo = dateToAbsoluteInputFormat(getTodayDate());
            expect(absoluteForm.getStartDate()).toEqual(expectedFrom);
            expect(absoluteForm.getEndDate()).toEqual(expectedTo);
        });

        it("should not have errors with valid input", () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-31"));
            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled(wrapper)).toBe(false);
        });

        it('should display error message when "Start" is later than "End" value and start is set twice', () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-31"));
            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-05-01"));

            expect(absoluteForm.getStartDate()).toEqual("05/01/2019");
            expect(absoluteForm.getEndDate()).toEqual("01/31/2019");
            expect(absoluteForm.isErrorVisible()).toBe(true);
            expect(isApplyButtonDisabled(wrapper)).toBe(true);
        });

        it('should display error message when "Start" is later than "End" value', () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-31"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-01"));

            expect(absoluteForm.getStartDate()).toEqual("01/31/2019");
            expect(absoluteForm.getEndDate()).toEqual("01/01/2019");
            expect(absoluteForm.isErrorVisible()).toBe(true);
            expect(isApplyButtonDisabled(wrapper)).toBe(true);
        });

        it('should not have errors when "from" = "to"', () => {
            const wrapper = createDateFilter();
            const absoluteForm = new AbsoluteForm(wrapper);
            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(dateToAbsoluteInputFormat("2019-01-01"));
            absoluteForm.setEndDate(dateToAbsoluteInputFormat("2019-01-01"));

            expect(absoluteForm.isErrorVisible()).toBe(false);
            expect(isApplyButtonDisabled(wrapper)).toBe(false);
        });
    });

    describe("relative form", () => {
        it("should open", () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            expect(isRelativeFormVisible(wrapper)).toBe(false);
            clickRelativeFormFilter(wrapper);
            expect(isRelativeFormVisible(wrapper)).toBe(true);
            clickAllTime(wrapper);
            expect(isRelativeFormVisible(wrapper)).toBe(false);
        });

        it("should have select menu closed by default", async () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickRelativeFormFilter(wrapper);
            expect(isRelativeFormSelectMenuVisible(wrapper)).toBe(false);
        });

        it("should have default granularity months", async () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickRelativeFormFilter(wrapper);
            expect(isRelativeFormGranularitySelected(wrapper, "month")).toBe(true);
        });

        it("should clear the form when Granularity changed", async () => {
            const wrapper = createDateFilter();
            clickDateFilterButton(wrapper);
            clickRelativeFormFilter(wrapper);

            clickRelativeFormGranularity(wrapper, "month");

            setRelativeFormInputs(wrapper, "-2", "2");

            expect(getRelativeFormInputFromValue(wrapper)).toEqual("2 months ago");

            clickRelativeFormGranularity(wrapper, "year");

            expect(getRelativeFormInputFromValue(wrapper)).toEqual("");
        });
    });

    describe("Absolute form with enabled time", () => {
        const dateFormat = "yyyy/MM/dd";
        const fromInputValue = dateToAbsoluteInputFormat("2019-10-15", dateFormat);
        const toInputValue = dateToAbsoluteInputFormat("2019-10-25", dateFormat);
        const isTimeForAbsoluteRangeEnabled = true;

        it("should set correct values with desired format", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({
                dateFormat,
                onApply,
                isTimeForAbsoluteRangeEnabled,
            });
            const absoluteForm = new AbsoluteForm(wrapper);

            const fromTime = "10:00";
            const toTime = "14:00";

            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);
            absoluteForm.setStartTime(fromTime);
            absoluteForm.setEndTime(toTime);

            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("2019/10/15, 10:00 – 2019/10/25, 14:00");

            clickDateFilterButton(wrapper);

            expect(getSelectedItemText(wrapper)).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
            expect(absoluteForm.getStartTime()).toEqual(fromTime);
            expect(absoluteForm.getEndTime()).toEqual(toTime);
        });

        it("should get default time values if not configured", () => {
            const onApply = jest.fn();
            const wrapper = createDateFilter({
                dateFormat,
                onApply,
                isTimeForAbsoluteRangeEnabled,
            });
            const absoluteForm = new AbsoluteForm(wrapper);

            clickDateFilterButton(wrapper);
            clickAbsoluteFormFilter(wrapper);

            absoluteForm.setStartDate(fromInputValue);
            absoluteForm.setEndDate(toInputValue);

            clickApplyButton(wrapper);

            setPropsFromOnApply(wrapper, onApply, 0);

            expect(getDateFilterButtonText(wrapper)).toEqual("2019/10/15 – 2019/10/25");

            clickDateFilterButton(wrapper);

            expect(getSelectedItemText(wrapper)).toEqual("Static period");
            expect(absoluteForm.getStartDate()).toEqual(fromInputValue);
            expect(absoluteForm.getEndDate()).toEqual(toInputValue);
            expect(absoluteForm.getStartTime()).toEqual("00:00");
            expect(absoluteForm.getEndTime()).toEqual("23:59");
        });
    });
});
