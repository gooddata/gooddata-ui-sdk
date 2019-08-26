// (C) 2007-2019 GoodData Corporation
import { Selector } from "testcafe";
import { config } from "./utils/config";
import { loginUsingLoginForm } from "./utils/helpers";

const clearButton = Selector(".s-clear");
const selectAllButton = Selector(".s-select_all");
const applyButton = Selector(".s-apply");
const attributeFiltersOverlay = Selector(".gd-attribute-filter-overlay");
const attributeFilterItems = attributeFiltersOverlay.find(".s-attribute-filter-list-item");

fixture("Attribute filter components")
    .page(config.url)
    .beforeEach(loginUsingLoginForm(`${config.url}/attribute-filter-components`));

test("Dropdown filter opens, clears, selects all and applies", async t => {
    const dropdownButton = Selector(".gd-button.s-employee_name");

    await t
        .click(dropdownButton)
        .expect(dropdownButton.hasClass("is-dropdown-open"))
        .ok()
        .expect(dropdownButton.hasClass("is-active"))
        .ok()
        .expect(attributeFilterItems.nth(0).child("input[type=checkbox]").checked)
        .ok()
        .click(clearButton)
        .expect(attributeFilterItems.nth(0).child("input[type=checkbox]").checked)
        .notOk()
        .click(selectAllButton)
        .expect(attributeFilterItems.nth(0).child("input[type=checkbox]").checked)
        .ok()
        .click(applyButton)
        .expect(dropdownButton.hasClass("is-dropdown-open"))
        .notOk()
        .expect(dropdownButton.hasClass("is-active"))
        .notOk();
});

test("Positive, negative and error attribute filters", async t => {
    const dropdownButton = Selector(".s-location_resort.gd-button");
    const lineChart = Selector(".s-line-chart");
    const markers = Selector(".highcharts-markers path");
    const error = Selector(".s-error .info-label");
    await t
        .hover(lineChart)
        .expect(markers.count)
        .eql(11, "Line chart renders incorrectly")
        .click(dropdownButton)
        .click(clearButton)
        .click(applyButton)
        .expect(error.exists)
        .ok()
        .expect(error.textContent)
        .eql("The filter must have at least one item selected")
        .click(dropdownButton)
        .click(selectAllButton)
        .click(applyButton)
        .expect(markers.count)
        .eql(11, "Filter works incorrectly with all items selected")
        .click(dropdownButton)
        .click(clearButton)
        .click(attributeFilterItems.nth(0).child("input[type=checkbox]"))
        .click(attributeFilterItems.nth(1).child("input[type=checkbox]"))
        .click(applyButton)
        .expect(markers.count)
        .eql(2, "Positive attribute filter works incorrectly")
        .click(dropdownButton)
        .click(selectAllButton)
        .click(attributeFilterItems.nth(0).child("input[type=checkbox]"))
        .click(attributeFilterItems.nth(1).child("input[type=checkbox]"))
        .click(applyButton)
        .expect(markers.count)
        .eql(9, "Negative attribute filter works incorrectly");
});

test("Custom filter shows more", async t => {
    const attributeFilterItem = Selector(".s-attribute-filter-list-item");
    const showMoreButton = Selector(".s-show-more-filters-button");

    await t
        .expect(attributeFilterItem.count)
        .eql(20) // NOTE: this test failed sometimes when --assertion-timout was 5 s
        .click(showMoreButton)
        .expect(attributeFilterItem.count)
        .eql(40);
});
