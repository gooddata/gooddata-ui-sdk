// (C) 2007-2020 GoodData Corporation

// migrated
import { navigateToStory } from "../_infra/testcafeUtils";
import {
    assertAbsoluteCalendarFromVisibility,
    assertAbsoluteCalendarToVisibility,
    assertDateFilterButtonText,
    assertRelativeFormFromInputValue,
    assertRelativeFormSelectFocusedMenuItem,
    clickAbsoluteCalendarOutsideDayAfterThisMonth,
    clickAbsoluteFormInputFrom,
    clickAbsoluteFormInputTo,
    clickApply,
    clickCancel,
    clickDateFilterButton,
    clickOnRelativeInputOption,
    clickOutside,
    clickStaticFilter,
    datesToAbsoluteFilterButtonFormat,
    openAbsoluteCalendarAndSetToFixedDate,
    openAbsoluteFormFilter,
    openRelativeFormFilter,
    relativeFormPickerFromInput,
    relativeFormPickerToInput,
    writeToRelativeFormInputFrom,
} from "./utils";

const allTimeTitle = "All time";

fixture("Date Filter").beforeEach(navigateToStory("50-stories-for-e2e-tests-date-filter--date-filter"));

test("Filter should not be applied when we change filter and press cancel", async () => {
    await assertDateFilterButtonText(allTimeTitle);
    await clickDateFilterButton();
    await clickStaticFilter("this-month");
    await clickCancel();
    await assertDateFilterButtonText(allTimeTitle);
});

test("Calendar appears when from field has focus", async () => {
    await openAbsoluteFormFilter();

    await assertAbsoluteCalendarFromVisibility(false);
    await assertAbsoluteCalendarToVisibility(false);

    await clickAbsoluteFormInputFrom();
    await assertAbsoluteCalendarFromVisibility(true);
    await assertAbsoluteCalendarToVisibility(false);

    await clickAbsoluteFormInputTo();
    await assertAbsoluteCalendarFromVisibility(false);
    await assertAbsoluteCalendarToVisibility(true);

    await clickOutside();
    await assertAbsoluteCalendarFromVisibility(false);
    await assertAbsoluteCalendarToVisibility(false);
});

test("It is possible to pick day outside current month", async () => {
    const from = "2019-03-15";
    const to = "2019-04-05";

    await openAbsoluteCalendarAndSetToFixedDate("03/15/2019", "03/15/2019");

    await clickAbsoluteFormInputTo();
    await clickAbsoluteCalendarOutsideDayAfterThisMonth(5);

    await clickApply();

    await assertDateFilterButtonText(datesToAbsoluteFilterButtonFormat(from, to));
});

test("Select menu item can be switched with arrow keys and enter", async (t) => {
    await openRelativeFormFilter();
    await t.click(relativeFormPickerFromInput);
    await assertRelativeFormSelectFocusedMenuItem("this month");
    await t.pressKey("down");
    await assertRelativeFormSelectFocusedMenuItem("next month");
    await t.pressKey("up");
    await assertRelativeFormSelectFocusedMenuItem("this month");
    await t.pressKey("up");
    await assertRelativeFormSelectFocusedMenuItem("last month");
    await t.pressKey("enter");
    await assertRelativeFormFromInputValue("last month");
});

test("Select menu item can be selected with mouse", async (t) => {
    await openRelativeFormFilter();
    await t.click(relativeFormPickerFromInput);
    await clickOnRelativeInputOption("this month");
    await assertRelativeFormFromInputValue("this month");
});

test("After selecting from range, to input gains focus", async (t) => {
    await openRelativeFormFilter();

    await t.expect(relativeFormPickerFromInput.focused).eql(false);
    await t.expect(relativeFormPickerToInput.focused).eql(false);

    await t.click(relativeFormPickerFromInput);

    await t.expect(relativeFormPickerFromInput.focused).eql(true);
    await t.expect(relativeFormPickerToInput.focused).eql(false);

    await t.pressKey("enter");

    await t.expect(relativeFormPickerFromInput.focused).eql(false);
    await t.expect(relativeFormPickerToInput.focused).eql(true);
});

test("If invalid string is inputted, keep the previous option", async (t) => {
    await openRelativeFormFilter();
    await writeToRelativeFormInputFrom("1");
    await t.pressKey("enter");
    await assertRelativeFormFromInputValue("next month");
    await writeToRelativeFormInputFrom("xxx");
    await t.pressKey("tab");
    await assertRelativeFormFromInputValue("next month");
});
