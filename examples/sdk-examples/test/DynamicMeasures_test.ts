// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Dynamic measures")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/dynamic-measures`));

test("should be able to set measures and render them", async (t) => {
    const sidebarItems = Selector(".s-dynamic-measures-sidebar .list-item");
    const lineSeries = Selector(".s-dynamic-measures-line-chart .highcharts-series");
    const columnSeries = Selector(".s-dynamic-measures-column-chart .highcharts-series");

    await t
        .expect(sidebarItems.count)
        .eql(4)
        .expect(lineSeries.count)
        .eql(4)
        .expect(columnSeries.count)
        .eql(4);

    await t
        .click(sidebarItems.nth(0))
        .click(sidebarItems.nth(1))
        .click(sidebarItems.nth(2))
        .expect(lineSeries.count)
        .eql(1)
        .expect(columnSeries.count)
        .eql(1);
});
