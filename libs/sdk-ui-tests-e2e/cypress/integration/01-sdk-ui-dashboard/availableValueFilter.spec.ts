// (C) 2024-2025 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { Headline } from "../../tools/headline";
import { Dashboard, FilterBar, TopBar } from "../../tools/dashboards";
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
    it(
        "should add metric filter by",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/dashboard-tiger-hide-filters");
            new Dashboard().waitForDashboardLoaded();

            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            new FilterBar().clickDateFilter().selectDateFilterOption(".s-all-time").clickApply();
            //wait for headline computed so that stabilize filter interaction
            cy.intercept("GET", "**/afm/execute/result/**").as("headlineExecution");
            cy.wait("@headlineExecution", { timeout: 15000 });
            accountFilter.isLoaded().open().elementsAreLoaded().selectAttribute(["101 Financial"]).apply();

            headline.waitLoaded().hasValue("7,200");

            cityFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .configureLimitingParentFilterDependency("Account")
                .elementsAreLoaded()
                .hasFilterListSize(2);

            cityFilter
                .configureLimitingMetricDependency("# of Lost Opps.")
                .elementsAreLoaded()
                .hasFilterListSize(1)
                .selectConfiguration()
                .searchMetricDependency("Invalid")
                .getNoDataMetricDependency()
                .searchMetricDependency("Account")
                .selectMetricDependency("Account")
                .elementsAreLoaded()
                .hasFilterListSize(2)
                .showAllElementValues()
                .selectAttribute(["Anaheim"])
                .apply();

            headline.waitLoaded().hasEmpty();

            cityFilter
                .open()
                .clearIrrelevantElementValuesIsVisible(true)
                .clearIrrelevantElementValues()
                .selectAttribute(["Seattle"])
                .apply();

            headline.waitLoaded().hasEmpty();

            cityFilter
                .open()
                .deleteFiltervaluesBy("Count of Account", "aggregated")
                .elementsAreLoaded()
                .hasFilterListSize(1);
        },
    );

    it(
        "should extend attribute filter by date filter",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/multiple-date-filters", featureFlags);
            cy.intercept("GET", "**/attributes**").as("attributes");

            cy.wait("@attributes", { timeout: 30000 }).then(() => {
                const dateFilter = new DateFilter();
                const dateFilterActivity = new DateFilter("Activity");
                const dateFilterAbsoluteForm = new DateFilterAbsoluteForm();
                topBar.enterEditMode().editButtonIsVisible(false);
                new InsightsCatalog().waitForCatalogLoad();

                dateFilter.openAndSelectOption(".s-absolute-form");
                dateFilterAbsoluteForm.typeIntoFromRangePickerInput("4/3/2010");
                dateFilter.openAndSelectOption(".s-absolute-form");
                dateFilterAbsoluteForm.typeIntoToRangePickerInput("4/3/2018");

                dateFilterActivity.openAndSelectOption(".s-absolute-form");
                dateFilterAbsoluteForm.typeIntoFromRangePickerInput("4/3/2010");
                dateFilterActivity.openAndSelectOption(".s-absolute-form");
                dateFilterAbsoluteForm.typeIntoToRangePickerInput("4/3/2018");
            });

            widget
                .waitChartLoaded()
                .getChart()
                .getDataLabelValues()
                .should("deep.equal", ["$4,108,360.80", "$2,267,528.48", "$3,461,373.87"]);

            salesRepFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .hasFilterListSize(22)
                .selectConfiguration()
                .configureLimitingDateFilterDependency("activity", "Date range")
                .elementsAreLoaded()
                .hasFilterListSize(20);

            salesRepFilter
                .selectConfiguration()
                .isSpecificDateFilterVisible("activity", false)
                .closeConfiguration()
                .deleteFiltervaluesBy("Date range as Activity")
                .selectConfiguration()
                .configureLimitingDateFilterDependency("activity", "Date specific")
                .elementsAreLoaded()
                .hasFilterListSize(20)
                .selectConfiguration()
                .isCommonDateFilterVisible("activity", false)
                .closeConfiguration()
                .selectAttribute(["Cory Owens"])
                .apply();

            cy.intercept("GET", "**/afm/execute/result/**").as("chartRender");
            cy.wait("@chartRender", { timeout: 30000 });
            widget.getChart().getDataLabelValues().should("deep.equal", ["$2,376,100.41"]);

            salesRepFilter.open().elementsAreLoaded().deleteFiltervaluesBy("Activity").hasFilterListSize(22);
        },
    );
});
