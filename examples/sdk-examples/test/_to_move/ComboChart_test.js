// // (C) 2007-2020 GoodData Corporation
// import { Selector } from "testcafe";
// import { config } from "./utils/config";
// import { loginUserAndNavigate } from "./utils/helpers";

// fixture("Combo chart").beforeEach(loginUserAndNavigate(`${config.url}/next/combo-chart`));

// test("Combo chart should render", async t => {
//     const loading = Selector(".s-loading");
//     const chart = Selector(".s-combo-chart");
//     await t
//         .expect(loading.exists)
//         .ok()
//         .expect(chart.exists)
//         .ok()
//         .expect(chart.textContent)
//         .ok();
// });
