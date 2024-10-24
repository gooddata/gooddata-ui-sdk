// (C) 2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";
import { FilterBar, TopBar } from "../../tools/dashboards";
import { AttributeFilter } from "../../tools/filterBar";
import { DateFilter } from "../../tools/dateFilter";
import { DateFilterAbsoluteForm } from "../../tools/dateFilterAbsoluteForm";
import { Widget } from "../../tools/widget";
import { ISettings } from "@gooddata/sdk-model";
import { InsightsCatalog } from "../../tools/insightsCatalog";

const headline = new Headline(".s-dash-item.viz-type-headline");
const topBar = new TopBar();
const widget = new Widget(0);
const cityFilter = new AttributeFilter("City");
const salesRepFilter = new AttributeFilter("Sales Rep");
const accountFilter = new AttributeFilter("Account");

const featureFlags: ISettings = {
    enableAttributeFilterValuesValidation: true,
    enableKDAttributeFilterDatesValidation: true,
};
describe("Available value filter", () => {
    it("should add metric filter by", { tags: "checklist_integrated_tiger" }, () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        cy.intercept("GET", "**/attributes**").as("attributes");
        topBar.enterEditMode().editButtonIsVisible(false);
        new InsightsCatalog().waitForCatalogLoad();
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

    it("should extend attribute filter by date filter", { tags: "checklist_integrated_tiger" }, () => {
        Navigation.visit("dashboard/multiple-date-filters", featureFlags);
        cy.intercept("GET", "**/attributes**").as("attributes");

        cy.wait("@attributes").then(() => {
            const dateFilter = new DateFilter();
            const dateFilterActivity = new DateFilter("Activity");
            const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();

            dateFilter.openAndSelectOption(".s-absolute-form");
            dateFilterAbsoluteForm
                .typeIntoFromRangePickerInput("4/3/2010")
                .typeIntoToRangePickerInput("4/3/2018");
            dateFilter.pressButton("apply");

            dateFilterActivity.openAndSelectOption(".s-absolute-form");
            dateFilterAbsoluteForm
                .typeIntoFromRangePickerInput("4/3/2010")
                .typeIntoToRangePickerInput("4/3/2018");
            dateFilterActivity.pressButton("apply");
        });

        widget
            .waitChartLoaded()
            .getChart()
            .getDataLabelValues()
            .should("deep.equal", ["$4,108,360.80", "$2,267,528.48", "$3,461,373.87"]);

        salesRepFilter
            .open()
            .elementsAreLoaded()
            .hasFilterListSize(22)
            .selectConfiguration()
            .configureLimitingDateFilterDependency("activity", "Date range")
            .hasFilterListSize(20);

        salesRepFilter
            .elementsAreLoaded()
            .selectConfiguration()
            .isSpecificDateFilterVisible("activity", false)
            .closeConfiguration()
            .deleteFiltervaluesBy("Date range as Activity")
            .selectConfiguration()
            .configureLimitingDateFilterDependency("activity", "Date specific")
            .hasFilterListSize(20)
            .selectConfiguration()
            .isCommonDateFilterVisible("activity", false)
            .closeConfiguration()
            .selectAttribute(["Cory Owens"])
            .apply();

        widget
            .waitLoadStarted()
            .waitChartLoaded()
            .getChart()
            .getDataLabelValues()
            .should("deep.equal", ["$2,376,100.41"]);

        salesRepFilter.open().elementsAreLoaded().deleteFiltervaluesBy("Activity").hasFilterListSize(22);
    });
});
