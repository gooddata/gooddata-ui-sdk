// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Global filter")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/global-filters`));

test("should filter components according to selected employee", async (t) => {
    const displayedNameSelector = Selector(".additional-info > h1");
    const kpiMetricSelector = Selector(".gdc-kpi");
    const listItemSelector = Selector(".list-item");
    await t
        .expect(displayedNameSelector.textContent)
        .eql("Aaron Clements")
        .expect(kpiMetricSelector.nth(0).textContent)
        .eql("$129")
        .expect(kpiMetricSelector.nth(1).textContent)
        .eql("$49")
        .click(listItemSelector.withText("Alex Meyer"))
        .expect(displayedNameSelector.textContent)
        .eql("Alex Meyer")
        .expect(kpiMetricSelector.nth(0).textContent)
        .eql("$157")
        .expect(kpiMetricSelector.nth(1).textContent)
        .eql("$25");
});
