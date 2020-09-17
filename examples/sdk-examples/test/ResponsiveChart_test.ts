// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Responsive chart")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/responsive`));

test("Responsive chart could be resized", async (t) => {
    const chart = Selector(".s-resizable-vis svg");
    const resizeButton = Selector(".s-resize-800x200");

    await t
        .expect(chart.boundingClientRect)
        .contains({ width: 500, height: 400 })
        .click(resizeButton)
        .expect(chart.boundingClientRect)
        .contains({ width: 800, height: 200 });
});
