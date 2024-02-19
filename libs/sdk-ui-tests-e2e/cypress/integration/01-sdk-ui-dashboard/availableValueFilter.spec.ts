// (C) 2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";
import { FilterBar, TopBar } from "../../tools/dashboards";
import { AttributeFilter } from "../../tools/filterBar";

const headline = new Headline(".s-dash-item.viz-type-headline");
const topBar = new TopBar();
const cityFilter = new AttributeFilter("City");
const accountFilter = new AttributeFilter("Account");
describe("Available value filter", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
    });

    it("should add metric filter by", { tags: "checklist_integrated_tiger" }, () => {
        cy.intercept("GET", "**/attributes**").as("attributes");
        topBar.enterEditMode().editButtonIsVisible(false);
        new FilterBar().clickDateFilter().selectDateFilterOption(".s-all-time").clickApply();
        cy.wait("@attributes").then(() => {
            accountFilter.open().selectAttribute(["101 Financial"]).apply();
        });

        headline.waitLoaded().hasValue("7,200");

        cityFilter
            .open()
            .elementsAreLoaded()
            .configureLimitingParentFilterDependency("Account")
            .hasFilterListSize(2);

        cityFilter
            .elementsAreLoaded()
            .configureLimitingMetricDependency("# of Lost Opps.")
            .hasFilterListSize(1)
            .selectConfiguration()
            .searchMetricDependency("Invalid")
            .getNoDataMetricDependency()
            .searchMetricDependency("Account")
            .selectMetricDependency("Account")
            .hasFilterListSize(2)
            .showAllElementValues()
            .selectAttribute(["Anaheim"])
            .apply();

        cityFilter
            .open()
            .elementsAreLoaded()
            .clearIrrelevantElementValuesIsVisible(true)
            .clearIrrelevantElementValues()
            .selectAttribute(["Seattle"])
            .apply();

        headline.waitLoaded().hasEmpty();

        cityFilter
            .open()
            .elementsAreLoaded()
            .deleteFiltervaluesBy("Count of Account", "aggregated")
            .elementsAreLoaded()
            .hasFilterListSize(1);
    });
});
