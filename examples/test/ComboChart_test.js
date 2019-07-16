// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Combo chart") // eslint-disable-line no-undef
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/next/combo-chart`));

test("Combo chart should render", async t => {
    const loading = Selector(".s-loading");
    const chart = Selector(".s-combo-chart");
    await t
        .expect(loading.exists)
        .ok()
        .expect(chart.exists)
        .ok()
        .expect(chart.textContent)
        .ok();
});
