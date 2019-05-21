// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Detepicker")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/advanced/date-picker`));

test("should be able to set from and to dates", async t => {
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
