// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Pivot Table Demo")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/pivot-table`));

test("should render all tables", async (t) => {
    const table = Selector(".s-pivot-table-sorting");
    const tableTotals = Selector(".s-pivot-table-totals");
    const tableDrilling = Selector(".s-pivot-table-drill");
    const tableDrillingCell = tableDrilling.find(".s-cell-0-2");
    const drillValue = Selector(".s-drill-value");
    await t.expect(table.exists).ok();
    await t.expect(tableTotals.exists).ok();
    await t.expect(tableDrilling.exists).ok();
    await t.click(tableDrillingCell);
    await t.expect(drillValue.textContent).eql("Alcoholic Beverages");
});
