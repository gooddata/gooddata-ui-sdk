// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUserAndNavigate } from "./utils/helpers";

fixture("Parent filter")
    .page(config.url)
    .beforeEach(loginUserAndNavigate(`${config.url}/advanced/parent-filter`));

test("Check if child filters are restricted by parent filters and visualization is properly filtered", async (t) => {
    const dropdownState = Selector(".s-select-state:not(.is-loading)");
    const dropdownStateList = Selector(
        ".s-select-state:not(.is-loading) .css-26l3qy-menu .css-4ljt47-MenuList",
    );
    const stateCalifornia = Selector(
        ".s-select-state:not(.is-loading) .css-26l3qy-menu .css-yt9ioa-option",
    ).withExactText("California");

    const dropdownCity = Selector(".s-select-city:not(.is-loading)");
    const dropdownCityList = Selector(".s-select-city:not(.is-loading) .css-26l3qy-menu");
    const citySanJose = Selector(
        ".s-select-city:not(.is-loading) .css-26l3qy-menu .css-yt9ioa-option",
    ).withExactText("San Jose");

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

    await t.click(citySanJose).expect(labels.textContent).eql("San Jose - Blossom HillSan Jose - Saratoga");
});
