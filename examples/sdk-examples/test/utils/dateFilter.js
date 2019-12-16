// (C) 2019 GoodData Corporation
import { Selector, t } from "testcafe";
import moment from "moment";

const dateFilterButton = Selector(".s-date-filter-button");
const dateFilterButtonText = dateFilterButton.find(".s-button-text");
const dateFilterBody = Selector(".s-extended-date-filters-body");

export const allTimeFilterButton = dateFilterBody.find(".s-all-time");
export const absoluteFormButton = dateFilterBody.find(".s-absolute-form");
const absoluteFormPicker = dateFilterBody.find(".s-date-range-picker");
const absoluteFormInputFrom = absoluteFormPicker.find(
    ".s-date-range-picker-from .s-date-range-picker-input-field",
);
const absoluteFormInputTo = absoluteFormPicker.find(
    ".s-date-range-picker-to .s-date-range-picker-input-field",
);
const absoluteCalendarFrom = Selector(".s-date-range-calendar-from");
const absoluteCalendarTo = Selector(".s-date-range-calendar-to");

export const relativeFormButton = dateFilterBody.find(".s-relative-form");
export const relativeFormPickerFromInput = Selector(".s-relative-range-picker-from .s-relative-range-input");
export const relativeFormPickerToInput = Selector(".s-relative-range-picker-to .s-relative-range-input");
const getRelativeFormGranularityTab = intlGranularity => Selector(`.gd-tab.s-granularity-${intlGranularity}`);
const relativeFormSelectMenu = Selector(".s-select-menu");
const relativeFormSelectMenuItems = relativeFormSelectMenu.find(".s-relative-date-filter-option");

const applyButton = dateFilterBody.find(".s-date-filter-apply");
const cancelButton = dateFilterBody.find(".s-date-filter-cancel");

const writeToInput = async (input, text) => {
    // TestCafe typeText does not support replacing the input with empty string
    if (!text) {
        await t.selectText(input).pressKey("delete");
    } else {
        await t.typeText(input, text, { replace: true });
    }
};

//
// Dropdown
//

export const assertDateFilterBodyVisibility = async (visible, formIndex = 0) => {
    await t.expect(dateFilterBody.nth(formIndex).exists).eql(visible);
};

export const assertDateFilterButtonText = async (text, formIndex = 0) => {
    await t.expect(dateFilterButtonText.nth(formIndex).innerText).eql(text);
};

export const clickDateFilterButton = async (formIndex = 0) => {
    await t.click(dateFilterButton.nth(formIndex));
};

export const clickApply = async () => {
    await t.click(applyButton);
};

export const clickCancel = async () => {
    await t.click(cancelButton);
};

export const datesToAbsoluteFilterButtonFormat = (dateStringFrom, dateStringTo) => {
    return `${moment(dateStringFrom).format("M/D/YYYY")}–${moment(dateStringTo).format("M/D/YYYY")}`;
};

//
// Outside click
//

export const clickOutside = async () => {
    // Some element that does not relate to tested stuff but is present on page.
    await t.click(Selector("body"), { offsetX: 0, offsetY: 0 });
};

export const getStaticFilterSelectorClass = filter => {
    return `.s-relative-preset-${filter}`;
};

export const getStaticFilterSelector = filter => {
    return Selector(getStaticFilterSelectorClass(filter));
};

export const clickAllTimeFilter = async () => {
    await t.click(allTimeFilterButton);
};

export const clickStaticFilter = async filter => {
    const button = getStaticFilterSelector(filter);
    await t.click(button);
};

export const assertFilterListItemSelected = async item => {
    await t.expect(item.hasClass("gd-filter-list-item-selected")).eql(true);
};

//
// Absolute filter form
//

export const clickAbsoluteFormFilter = async () => {
    await t.click(absoluteFormButton);
};

export const openAbsoluteFormFilter = async (formIndex = 0) => {
    await clickDateFilterButton(formIndex);
    await clickAbsoluteFormFilter();
};

export const writeToAbsoluteFormInputFrom = async text => {
    await writeToInput(absoluteFormInputFrom, text);
};

export const writeToAbsoluteFormInputTo = async text => {
    await writeToInput(absoluteFormInputTo, text);
};

export const assertAbsoluteFormFromInputValue = async expected => {
    await t.expect(absoluteFormInputFrom.value).eql(expected);
};

export const assertAbsoluteFormToInputValue = async expected => {
    await t.expect(absoluteFormInputTo.value).eql(expected);
};

export const dateToAbsoluteInputFormat = dateString => {
    return moment(dateString).format("MM/DD/YYYY");
};

export const assertAbsoluteCalendarFromVisibility = async visible => {
    await t.expect(absoluteCalendarFrom.exists).eql(visible);
};

export const assertAbsoluteCalendarToVisibility = async visible => {
    await t.expect(absoluteCalendarTo.exists).eql(visible);
};

export const clickAbsoluteFormInputFrom = async () => {
    await t.click(absoluteFormInputFrom);
};

export const clickAbsoluteFormInputTo = async () => {
    await t.click(absoluteFormInputTo);
};

export const openAbsoluteCalendarAndSetToFixedDate = async (from, to) => {
    await openAbsoluteFormFilter();

    // Before we start interacting with calendar, we set it to exact day to
    // make sure all our relative operations (go one month back) are relative
    // to the same date and not to the default date that is floating.
    await writeToAbsoluteFormInputFrom(from);
    await writeToAbsoluteFormInputTo(to);
};

export const clickAbsoluteCalendarDay = async dayNumber => {
    const day = Selector(".DayPicker-Day:not(.DayPicker-Day--outside)").nth(dayNumber - 1);
    await t.click(day);
};

export const clickAbsoluteCalendarOutsideDayAfterThisMonth = async dayNumber => {
    const day = Selector(".DayPicker-Week:last-child .DayPicker-Day--outside").nth(dayNumber - 1);
    await t.click(day);
};

//
// Relative form
//

export const clickRelativeFormFilter = async () => {
    await t.click(relativeFormButton);
};

export const openRelativeFormFilter = async () => {
    await clickDateFilterButton();
    await clickRelativeFormFilter();
};

export const clickRelativeFormGranularity = async granularity => {
    const granularityTab = getRelativeFormGranularityTab(granularity);
    await t.click(granularityTab);
};

export const assertRelativeFormGranularitySelected = async granularity => {
    const tab = getRelativeFormGranularityTab(granularity);
    await t.expect(tab.hasClass("is-active")).ok();
};

export const writeToRelativeFormInputFrom = async text => {
    await writeToInput(relativeFormPickerFromInput, String(text));
};

export const writeToRelativeFormInputTo = async text => {
    await writeToInput(relativeFormPickerToInput, String(text));
};

export const assertRelativeFormFromInputValue = async expected => {
    await t.expect(relativeFormPickerFromInput.value).eql(expected);
};

export const assertRelativeFormToInputValue = async expected => {
    await t.expect(relativeFormPickerToInput.value).eql(expected);
};

export const assertRelativeFormSelectFocusedMenuItem = async text => {
    const item = await relativeFormSelectMenuItems.withExactText(text);
    await t.expect(item.exists).eql(true);
    await t
        .expect(item.hasClass("s-select-item-focused"))
        .eql(true, `Item with text "${await item.innerText}" is not focused`);
};

export const confirmRelativeInputOption = async () => {
    await t.pressKey("enter");
};

export const clickOnRelativeInputOption = async text => {
    const item = await relativeFormSelectMenuItems.withExactText(text);
    await t.click(item);
};

export const assertRelativeFormSelectMenuContent = async labels => {
    const joinedLabels = Array.isArray(labels) ? labels.join("") : labels;
    return t.expect(relativeFormSelectMenu.textContent).eql(joinedLabels);
};
