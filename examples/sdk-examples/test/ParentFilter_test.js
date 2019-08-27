// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

fixture("Parent filter")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/advanced/parent-filter`));

test("Check if child filters are restricted by parent filters and visualization is properly filtered", async t => {
    const dropdownState = Selector(".s-select-state:not(.is-loading)");
    const dropdownStateList = Selector(".s-select-state:not(.is-loading) .Select-menu");
    const stateCalifornia = Selector(".s-select-state:not(.is-loading) .Select-option").withText(
        "California",
    );

    const dropdownCity = Selector(".s-select-city:not(.is-loading)");
    const dropdownCityList = Selector(".s-select-city:not(.is-loading) .Select-menu");
    const citySanJose = Selector(".s-select-city:not(.is-loading) .Select-option").withText("San Jose");

    const labels = Selector(".highcharts-xaxis-labels");

    await t
        .click(dropdownState)
        .expect(dropdownStateList.textContent)
        .eql("AlabamaCaliforniaFloridaNew YorkTexas");

    await t
        .click(stateCalifornia)
        .click(dropdownCity)
        .expect(dropdownCityList.textContent)
        .eql("Daly CityHaywardHighland VillageSan Jose");

    await t
        .click(citySanJose)
        .expect(labels.textContent)
        .eql("San Jose - Blossom HillSan Jose - Saratoga");
});
