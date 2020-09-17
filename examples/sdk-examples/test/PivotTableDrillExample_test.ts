// (C) 2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

const DRILLED_VALUE = ".s-drill-value";
const MENU_CATEGORY_ATTRIBUTE_VALUE = ".ag-body-viewport .s-cell-3-2";
const FRANCHISE_FEES_MEASURE_VALUE = ".ag-body-viewport .s-cell-3-3";
const FRANCHISE_FEES_GRAND_TOTAL_VALUE = ".ag-floating-bottom .s-cell-0-3";
const FRANCHISE_FEES_SUB_TOTAL_VALUE = ".ag-body-viewport .s-cell-5-3";

fixture("Pivot Table Drill")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/drilling/pivot-table-drilling`));

test("should drill on attribute value", async (t) => {
    await t
        .click(Selector(MENU_CATEGORY_ATTRIBUTE_VALUE))
        .expect(Selector(DRILLED_VALUE).textContent)
        .eql("Enhancements");
});

test("should drill on measure value", async (t) => {
    await t
        .click(Selector(FRANCHISE_FEES_MEASURE_VALUE))
        .expect(Selector(DRILLED_VALUE).textContent)
        .eql("50642.82025");
});

test("should not drill on grand total value", async (t) => {
    await t.click(Selector(FRANCHISE_FEES_GRAND_TOTAL_VALUE)).expect(Selector(DRILLED_VALUE).exists).notOk();
});

test("should not drill on sub total value", async (t) => {
    await t.click(Selector(FRANCHISE_FEES_SUB_TOTAL_VALUE)).expect(Selector(DRILLED_VALUE).exists).notOk();
});
