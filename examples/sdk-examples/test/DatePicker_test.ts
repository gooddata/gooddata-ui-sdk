// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Datepicker")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/date-picker`));

test("Should be able to set from and to dates", async (t) => {
    const datePickerFrom = Selector(".s-date-picker-from .gd-input-field");
    const datePickerFromNext = Selector(".s-date-picker-from .react-datepicker__navigation--next");
    const datePickerFromDay1 = Selector(".s-date-picker-from .react-datepicker__day").nth(3);
    const datePickerTo = Selector(".s-date-picker-to .gd-input-field");
    const datePickerToPrevious = Selector(".s-date-picker-to .react-datepicker__navigation--previous");
    const datePickerToDay1 = Selector(".s-date-picker-to .react-datepicker__day").nth(2);
    const xAxisLabels = Selector(".s-date-picker-chart .highcharts-xaxis-labels");

    await t.expect(xAxisLabels.textContent).eql("JanFebMarAprMayJunJulAugSepOctNovDec");

    await t
        .click(datePickerFrom)
        .click(datePickerFromNext)
        .click(datePickerFromDay1)
        .expect(xAxisLabels.textContent)
        .eql("FebMarAprMayJunJulAugSepOctNovDec");

    await t
        .click(datePickerTo)
        .click(datePickerToPrevious)
        .click(datePickerToDay1)
        .expect(xAxisLabels.textContent)
        .eql("FebMarAprMayJunJulAugSepOct");
});

test("Should be able to set from and to months", async (t) => {
    const monthPickerFrom = Selector(".s-month-picker-from .gd-input-field");
    const monthPickerFromNext = Selector(".s-month-picker-from .react-datepicker__navigation--next");
    const datePickerFromDay3 = Selector(".s-month-picker-from .react-datepicker__day").nth(3);
    const monthPickerTo = Selector(".s-month-picker-to .gd-input-field");
    const monthPickerToPrevious = Selector(".s-month-picker-to .react-datepicker__navigation--previous");
    const datePickerToDay3 = Selector(".s-month-picker-to .react-datepicker__day").nth(6);
    const chart = Selector(".s-month-picker-chart");
    const xAxisLabels = Selector(".s-month-picker-chart .highcharts-xaxis-labels");

    await t
        .hover(chart)
        .expect(monthPickerTo.value)
        .eql("01/2017")
        .expect(monthPickerFrom.value)
        .eql("01/2016")
        .expect(xAxisLabels.textContent)
        .eql(
            "Jan 2016Feb 2016Mar 2016Apr 2016May 2016Jun 2016Jul 2016Aug 2016Sep 2016Oct 2016Nov 2016Dec 2016Jan 2017",
        );

    await t
        .click(monthPickerFrom)
        .click(monthPickerFromNext)
        .click(datePickerFromDay3)
        .expect(xAxisLabels.textContent)
        .eql(
            "Feb 2016Mar 2016Apr 2016May 2016Jun 2016Jul 2016Aug 2016Sep 2016Oct 2016Nov 2016Dec 2016Jan 2017",
        );

    await t
        .click(monthPickerTo)
        .click(monthPickerToPrevious)
        .click(datePickerToDay3)
        .expect(xAxisLabels.textContent)
        .eql("Feb 2016Mar 2016Apr 2016May 2016Jun 2016Jul 2016Aug 2016Sep 2016Oct 2016Nov 2016Dec 2016");
});
