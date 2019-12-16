// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";
import * as DF from "./utils/dateFilter";

const allTimeTitle = "All time";

fixture("Date Filter basic interactions")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/date-filter-component`));

test("Filter button click should open/close the filters", async () => {
    await DF.assertDateFilterBodyVisibility(false);
    await DF.clickDateFilterButton();
    await DF.assertDateFilterBodyVisibility(true);
    await DF.clickDateFilterButton();
    await DF.assertDateFilterButtonText(allTimeTitle);
    await DF.assertDateFilterBodyVisibility(false);
});

test("Filter should close when we click outside of them", async () => {
    await DF.clickDateFilterButton();
    await DF.clickOutside();
    await DF.assertDateFilterButtonText(allTimeTitle);
    await DF.assertDateFilterBodyVisibility(false);
});

test("Filter should close when we click cancel", async () => {
    await DF.clickDateFilterButton();
    await DF.clickCancel();
    await DF.assertDateFilterButtonText(allTimeTitle);
    await DF.assertDateFilterBodyVisibility(false);
});

test("Filter should not be applied when we change filter and press cancel", async () => {
    await DF.assertDateFilterButtonText(allTimeTitle);
    await DF.clickDateFilterButton();
    await DF.clickStaticFilter("this-month");
    await DF.clickCancel();
    await DF.assertDateFilterButtonText(allTimeTitle);
});

test("Reopening all time should keep it selected", async () => {
    await DF.clickDateFilterButton();
    await DF.clickAllTimeFilter();
    await DF.clickApply();
    await DF.assertDateFilterButtonText(allTimeTitle);

    await DF.clickDateFilterButton();
    await DF.assertFilterListItemSelected(DF.allTimeFilterButton);
});

test("Reopening a relative preset should keep it selected", async () => {
    await DF.clickDateFilterButton();
    await DF.clickStaticFilter("last-month");
    await DF.clickApply();
    await DF.assertDateFilterButtonText("Last month");

    await DF.clickDateFilterButton();
    await DF.assertFilterListItemSelected(DF.getStaticFilterSelector("last-month"));
});

test("Reopening an absolute form should keep it selected and filled", async () => {
    const fromInputValue = DF.dateToAbsoluteInputFormat("2019-01-01");
    const toInputValue = DF.dateToAbsoluteInputFormat("2019-01-31");

    await DF.openAbsoluteFormFilter();
    await DF.writeToAbsoluteFormInputFrom(fromInputValue);
    await DF.writeToAbsoluteFormInputTo(toInputValue);
    await DF.clickApply();
    await DF.assertDateFilterButtonText("1/1/2019–1/31/2019");

    await DF.clickDateFilterButton();
    await DF.assertFilterListItemSelected(DF.absoluteFormButton);
    await DF.assertAbsoluteFormFromInputValue(fromInputValue);
    await DF.assertAbsoluteFormToInputValue(toInputValue);
});

test("Reopening a relative form should keep it selected and filled", async t => {
    await DF.openRelativeFormFilter();
    await DF.clickRelativeFormGranularity("year");
    await DF.writeToRelativeFormInputFrom("-2");
    await t.pressKey("enter");
    await DF.writeToRelativeFormInputTo("2");
    await t.pressKey("enter");
    await DF.clickApply();
    await DF.assertDateFilterButtonText("From 2 years ago to 2 years ahead");

    await DF.clickDateFilterButton();
    await DF.assertRelativeFormGranularitySelected("year");
    await DF.assertRelativeFormFromInputValue("2 years ago");
    await DF.assertRelativeFormToInputValue("2 years ahead");
});

fixture("Date Filter with visualization")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/date-filter-component`));

test("Applying date should execute and filter visualization using the selected value", async t => {
    const fromInputValue = DF.dateToAbsoluteInputFormat("2016-01-01");
    const toInputValue = DF.dateToAbsoluteInputFormat("2016-01-31");

    const expectedValues = "2,707,184";
    const chartValues = Selector(".highcharts-data-labels");

    await t
        .expect(chartValues.exists)
        .ok()
        .expect(chartValues.textContent)
        .notEql(expectedValues);

    await DF.openAbsoluteFormFilter(1);
    await DF.writeToAbsoluteFormInputFrom(fromInputValue);
    await DF.writeToAbsoluteFormInputTo(toInputValue);
    await DF.clickApply();

    await t
        .expect(chartValues.exists)
        .ok()
        .expect(chartValues.textContent)
        .eql(expectedValues);
});

fixture("Absolute Date Filter form")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/date-filter-component`));

test("Calendar appears when from field has focus", async () => {
    await DF.openAbsoluteFormFilter();

    await DF.assertAbsoluteCalendarFromVisibility(false);
    await DF.assertAbsoluteCalendarToVisibility(false);

    await DF.clickAbsoluteFormInputFrom();
    await DF.assertAbsoluteCalendarFromVisibility(true);
    await DF.assertAbsoluteCalendarToVisibility(false);

    await DF.clickAbsoluteFormInputTo();
    await DF.assertAbsoluteCalendarFromVisibility(false);
    await DF.assertAbsoluteCalendarToVisibility(true);

    await DF.clickOutside();
    await DF.assertAbsoluteCalendarFromVisibility(false);
    await DF.assertAbsoluteCalendarToVisibility(false);
});

// There is problem with following tests that TestCafe probably behaves
// differently than regular user events. This leads to problems where both
// calendars are displayed on top of each other and clicks events (that should
// close the calendars) are ignored.
// Function that seems to break stuff is openAbsoluteCalendarAndSetToFixedDate.
// When we resolve RAIL-1447 that changes how focus management works
// with calendar, these issues might be resolved.
// Stuff that should be tested:
//   - next/prev month buttons
//   - outside month days (gray days from previous/next month)
//   - range crossing
test("It is possible to pick days in calendar", async () => {
    const from = "2019-04-01";
    const to = "2019-04-30";

    await DF.openAbsoluteCalendarAndSetToFixedDate("04/15/2019", "04/15/2019");

    await DF.clickAbsoluteFormInputFrom();
    await DF.clickAbsoluteCalendarDay(1);

    await DF.clickAbsoluteFormInputTo();
    await DF.clickAbsoluteCalendarDay(30);

    await DF.clickApply();

    await DF.assertDateFilterButtonText(DF.datesToAbsoluteFilterButtonFormat(from, to));
});

test("It is possible to pick day outside current month", async () => {
    const from = "2019-03-15";
    const to = "2019-04-05";

    await DF.openAbsoluteCalendarAndSetToFixedDate("03/15/2019", "03/15/2019");

    await DF.clickAbsoluteFormInputTo();
    await DF.clickAbsoluteCalendarOutsideDayAfterThisMonth(5);

    await DF.clickApply();

    await DF.assertDateFilterButtonText(DF.datesToAbsoluteFilterButtonFormat(from, to));
});

fixture("Relative Date Filter form")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/date-filter-component`));

test("Select menu is filtered by input", async () => {
    await DF.openRelativeFormFilter();
    await DF.writeToRelativeFormInputFrom("5");
    await DF.assertRelativeFormSelectMenuContent(["5 months ahead", "5 months ago"]);
});

test("Select menu item can be selected with enter", async t => {
    await DF.openRelativeFormFilter();
    await t.click(DF.relativeFormPickerFromInput);
    await t.pressKey("enter");
    await DF.assertRelativeFormFromInputValue("this month");
});

test("Select menu item can be switched with arrow keys and enter", async t => {
    await DF.openRelativeFormFilter();
    await t.click(DF.relativeFormPickerFromInput);
    await DF.assertRelativeFormSelectFocusedMenuItem("this month");
    await t.pressKey("down");
    await DF.assertRelativeFormSelectFocusedMenuItem("next month");
    await t.pressKey("up");
    await DF.assertRelativeFormSelectFocusedMenuItem("this month");
    await t.pressKey("up");
    await DF.assertRelativeFormSelectFocusedMenuItem("last month");
    await t.pressKey("enter");
    await DF.assertRelativeFormFromInputValue("last month");
});

test("Select menu item can be selected with mouse", async t => {
    await DF.openRelativeFormFilter();
    await t.click(DF.relativeFormPickerFromInput);
    await DF.clickOnRelativeInputOption("this month");
    await DF.assertRelativeFormFromInputValue("this month");
});

test("After selecting from range, to input gains focus", async t => {
    await DF.openRelativeFormFilter();

    await t.expect(DF.relativeFormPickerFromInput.focused).eql(false);
    await t.expect(DF.relativeFormPickerToInput.focused).eql(false);

    await t.click(DF.relativeFormPickerFromInput);

    await t.expect(DF.relativeFormPickerFromInput.focused).eql(true);
    await t.expect(DF.relativeFormPickerToInput.focused).eql(false);

    await t.pressKey("enter");

    await t.expect(DF.relativeFormPickerFromInput.focused).eql(false);
    await t.expect(DF.relativeFormPickerToInput.focused).eql(true);
});

test("If invalid string is inputted, keep the previous option", async t => {
    await DF.openRelativeFormFilter();
    await DF.writeToRelativeFormInputFrom("1");
    await t.pressKey("enter");
    await DF.assertRelativeFormFromInputValue("next month");
    await DF.writeToRelativeFormInputFrom("xxx");
    await t.pressKey("tab");
    await DF.assertRelativeFormFromInputValue("next month");
});

test("Filter is applied with more complex interaction", async t => {
    const defaultRelativeYearsMenuContent = [
        "12 years ago",
        "11 years ago",
        "10 years ago",
        "9 years ago",
        "8 years ago",
        "7 years ago",
        "6 years ago",
        "5 years ago",
        "4 years ago",
        "3 years ago",
        "2 years ago",
        "last year",
        "this year",
        "next year",
        "2 years ahead",
        "3 years ahead",
        "4 years ahead",
        "5 years ahead",
        "6 years ahead",
        "7 years ahead",
        "8 years ahead",
        "9 years ahead",
        "10 years ahead",
        "11 years ahead",
        "12 years ahead",
    ];
    await DF.openRelativeFormFilter();
    await DF.clickRelativeFormGranularity("year");

    await t.click(DF.relativeFormPickerFromInput);
    await DF.assertRelativeFormSelectMenuContent(defaultRelativeYearsMenuContent);
    await DF.writeToRelativeFormInputFrom("-2");
    await DF.assertRelativeFormSelectMenuContent("2 years ago");

    await DF.confirmRelativeInputOption(); // changes focus to second field
    await DF.assertRelativeFormFromInputValue("2 years ago");

    await DF.assertRelativeFormSelectMenuContent(defaultRelativeYearsMenuContent);
    await DF.writeToRelativeFormInputTo("2 years ahead");
    await DF.confirmRelativeInputOption();
    await DF.assertRelativeFormToInputValue("2 years ahead");

    // Must blur TO field to open menu again
    await t.click(DF.relativeFormPickerFromInput);
    await t.click(DF.relativeFormPickerToInput);

    // focus on filled input clears it and thus displays default options
    await DF.assertRelativeFormSelectMenuContent(defaultRelativeYearsMenuContent);

    // blur reselects last selected item
    await DF.clickApply();
    await DF.assertDateFilterButtonText("From 2 years ago to 2 years ahead");
});
