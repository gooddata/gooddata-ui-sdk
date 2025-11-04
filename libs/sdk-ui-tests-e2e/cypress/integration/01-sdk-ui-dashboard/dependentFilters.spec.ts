// (C) 2023-2025 GoodData Corporation

import { Dashboard, TopBar } from "../../tools/dashboards";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { Widget } from "../../tools/widget";

const regionFilter = new AttributeFilter("Region");
const stateFilter = new AttributeFilter("State");
const cityFilter = new AttributeFilter("City");
const product = new AttributeFilter("Product");
const stageName = new AttributeFilter("Stage Name");
const table = new Table(".s-dash-item-0_0");
const topBar = new TopBar();
const filterBar = new FilterBar();

describe("Dependent filter", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-dependent-filters");
    });

    it.skip(
        "should test parent - child interaction in view mode",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            table
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", [
                    "Bridgeport",
                    "Hartford",
                    "Boston",
                    "Nashua",
                    "New York",
                    "Poughkeepsie",
                    "Portland",
                    "Philadelphia",
                    "Providence",
                ]);

            stateFilter.isLoaded().open().selectAttribute(["Connecticut"]).apply();

            table
                .waitLoadStarted()
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", ["Bridgeport", "Hartford"]);

            cityFilter
                .isLoaded()
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(6)
                .hasSelectedValueList([
                    "Bridgeport",
                    "Danbury",
                    "Hartford",
                    "New Haven",
                    "Norwich",
                    "Waterbury",
                ])
                .hasValueList(["Bridgeport", "Danbury", "Hartford", "New Haven", "Norwich", "Waterbury"])
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .showAllElementValuesIsVisible(false)
                .hasFilterListSize(300)
                .selectAttribute(["Hartford"])
                .apply()
                .isLoaded()
                .hasSubtitle("Hartford");

            table.waitLoadStarted().waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);

            stateFilter.open().selectAttribute(["Oregon"]).apply();

            table.isEmpty();

            cityFilter
                .open()
                .hasSubtitle("Hartford")
                .hasFilterListSize(4)
                .hasSelectedValueList([])
                .hasValueList(["Eugene", "Medford", "Portland", "Salem"])
                .containElementsListStatus("Hartford")
                .clearIrrelevantElementValuesIsVisible(true)
                .clearIrrelevantElementValues()
                .clearIrrelevantElementValuesIsVisible(false)
                .containElementsListStatus("None")
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .showAllElementValuesIsVisible(false)
                .containElementsListStatus("None")
                .hasFilterListSize(300)
                .selectAttribute(["New York"])
                .containElementsListStatus("New York")
                .close()
                .open()
                .hasSubtitle("Hartford")
                .hasFilterListSize(4)
                .hasSelectedValueList([])
                .hasValueList(["Eugene", "Medford", "Portland", "Salem"])
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .close()
                .open()
                .searchAndSelectFilterItem("Medford")
                .containElementsListStatus("Hartford, Medford")
                .clearIrrelevantElementValues()
                .clearSearch()
                .elementsAreLoaded()
                .hasSelectedValueList(["Medford"]);

            stateFilter.open().selectAttribute(["Connecticut", "Oregon"]).apply();

            table.waitLoadStarted().waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);

            cityFilter
                .open()
                .hasSubtitle("Hartford")
                .hasFilterListSize(10)
                .hasSelectedValueList(["Hartford"]);
        },
    );

    it.skip(
        "should test parent - child interaction in edit mode",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            table
                .waitLoaded()
                .getColumnValues(1)
                .should("deep.equal", [
                    "Connecticut",
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            stateFilter
                .isLoaded()
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(48)
                .configureLimitingParentFilterDependency("Region")
                .hasFilterListSize(7)
                .hasSelectedValueList([
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            table
                .waitLoaded()
                .getColumnValues(1)
                .should("deep.equal", [
                    "Connecticut",
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            regionFilter.open().selectAttribute(["West Coast"]).apply();
            table.waitLoadStarted().waitLoaded();

            stateFilter
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(3)
                .hasSelectedValueList(["California", "Oregon", "Washington"])
                .hasValueList(["California", "Oregon", "Washington"])
                .selectAttribute(["California"])
                .apply()
                .isLoaded()
                .hasSubtitle("California");

            cy.wait(1000);

            cityFilter
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(50)
                .configureLimitingParentFilterDependency("Region")
                .hasFilterListSize(7)
                .selectAttribute(["Sacramento"])
                .apply();

            table.waitLoadStarted().waitLoaded();

            cityFilter.isLoaded().hasSubtitle("Sacramento");

            table.getColumnValues(0).should("deep.equal", ["West Coast"]);
            table.getColumnValues(1).should("deep.equal", ["California"]);
            table.getColumnValues(2).should("deep.equal", ["Sacramento"]);

            regionFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .selectAttribute(["East Coast"])
                .apply();

            cy.wait(1000);

            stateFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true);
            cityFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true);
            regionFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .selectAttribute(["West Coast"])
                .apply();

            cy.wait(1000);

            stateFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(true);
            cityFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(true);

            topBar.cancelEditMode().discardChanges().editButtonIsVisible(true);

            table.waitLoaded();

            regionFilter.isLoaded().open().hasSubtitle("East Coast").hasFilterListSize(4);
            stateFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(48);
            cityFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(300);
        },
    );

    it(
        "should test parent - child interaction in view mode",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            table
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", [
                    "Bridgeport",
                    "Hartford",
                    "Boston",
                    "Nashua",
                    "New York",
                    "Poughkeepsie",
                    "Portland",
                    "Philadelphia",
                    "Providence",
                ]);

            stateFilter.isLoaded().open().elementsAreLoaded().selectAttribute(["Connecticut"]).apply();

            table
                .waitLoadStarted()
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", ["Bridgeport", "Hartford"]);

            cityFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .hasSubtitle("All")
                .hasFilterListSize(6)
                .hasSelectedValueList([
                    "Bridgeport",
                    "Danbury",
                    "Hartford",
                    "New Haven",
                    "Norwich",
                    "Waterbury",
                ])
                .hasValueList(["Bridgeport", "Danbury", "Hartford", "New Haven", "Norwich", "Waterbury"])
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .showAllElementValuesIsVisible(false)
                .hasFilterListSize(300)
                .selectAttribute(["Hartford"])
                .apply()
                .isLoaded()
                .hasSubtitle("Hartford");

            table.waitLoadStarted().waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);

            stateFilter.open().selectAttribute(["Oregon"]).apply();

            new Widget(0).hasNoDataForFilter();

            cityFilter
                .open()
                .elementsAreLoaded()
                .hasSubtitle("Hartford")
                .hasFilterListSize(4)
                .hasSelectedValueList([])
                .hasValueList(["Eugene", "Medford", "Portland", "Salem"])
                .containElementsListStatus("Hartford")
                .clearIrrelevantElementValuesIsVisible(true)
                .clearIrrelevantElementValues()
                .clearIrrelevantElementValuesIsVisible(false)
                .containElementsListStatus("None")
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .showAllElementValuesIsVisible(false)
                .containElementsListStatus("None")
                .hasFilterListSize(300)
                .selectAttribute(["New York"])
                .containElementsListStatus("New York")
                .close()
                .open()
                .hasSubtitle("Hartford")
                .hasFilterListSize(4)
                .hasSelectedValueList([])
                .hasValueList(["Eugene", "Medford", "Portland", "Salem"])
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .close()
                .open()
                .searchAndSelectFilterItem("Medford")
                .containElementsListStatus("Hartford, Medford")
                .clearIrrelevantElementValues()
                .clearSearch()
                .elementsAreLoaded()
                .hasSelectedValueList(["Medford"]);

            stateFilter.open().selectAttribute(["Connecticut", "Oregon"]).apply();

            table.waitLoadStarted().waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);

            cityFilter
                .open()
                .elementsAreLoaded()
                .hasSubtitle("Hartford")
                .hasFilterListSize(10)
                .hasSelectedValueList(["Hartford"]);
        },
    );

    it(
        "should test parent - child interaction in edit mode",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            table
                .waitLoaded()
                .getColumnValues(1)
                .should("deep.equal", [
                    "Connecticut",
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            stateFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .hasSubtitle("All")
                .hasFilterListSize(48)
                .configureLimitingParentFilterDependency("Region")
                .elementsAreLoaded()
                .hasFilterListSize(7)
                .hasSelectedValueList([
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            table
                .waitLoaded()
                .getColumnValues(1)
                .should("deep.equal", [
                    "Connecticut",
                    "Connecticut",
                    "Massachusetts",
                    "New Hampshire",
                    "New York",
                    "New York",
                    "Oregon",
                    "Pennsylvania",
                    "Rhode Island",
                ]);

            regionFilter.open().elementsAreLoaded().selectAttribute(["West Coast"]).apply();
            table.waitLoadStarted().waitLoaded();

            stateFilter
                .open()
                .hasSubtitle("All")
                .hasFilterListSize(3)
                .hasSelectedValueList(["California", "Oregon", "Washington"])
                .hasValueList(["California", "Oregon", "Washington"])
                .selectAttribute(["California"])
                .apply()
                .isLoaded()
                .hasSubtitle("California");

            table.waitLoadStarted().waitLoaded();

            cityFilter
                .open()
                .elementsAreLoaded()
                .hasSubtitle("All")
                .hasFilterListSize(50)
                .configureLimitingParentFilterDependency("Region")
                .elementsAreLoaded()
                .hasFilterListSize(7)
                .selectAttribute(["Sacramento"])
                .apply();

            table.waitLoadStarted().waitLoaded();

            cityFilter.isLoaded().hasSubtitle("Sacramento");

            table.getColumnValues(0).should("deep.equal", ["West Coast"]);
            table.getColumnValues(1).should("deep.equal", ["California"]);
            table.getColumnValues(2).should("deep.equal", ["Sacramento"]);

            regionFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .selectAttribute(["East Coast"])
                .apply();

            new Widget(0).hasNoDataForFilter();

            stateFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true);
            cityFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(true)
                .showAllElementValuesIsVisible(true);
            regionFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(false)
                .selectAttribute(["West Coast"])
                .apply();

            table.waitLoadStarted().waitLoaded();

            stateFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(true);
            cityFilter
                .open()
                .elementsAreLoaded()
                .clearIrrelevantElementValuesIsVisible(false)
                .showAllElementValuesIsVisible(true);

            topBar.cancelEditMode().discardChanges().editButtonIsVisible(true);
            new Dashboard().waitForDashboardLoaded();
            table.waitLoaded();

            regionFilter.isLoaded().open().elementsAreLoaded().hasSubtitle("East Coast").hasFilterListSize(4);
            stateFilter.isLoaded().open().elementsAreLoaded().hasSubtitle("All").hasFilterListSize(48);
            cityFilter.isLoaded().open().elementsAreLoaded().hasSubtitle("All").hasFilterListSize(300);
        },
    );

    it(
        "child filter can reduce to zero element by parent filter",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            product.open().elementsAreLoaded().selectAttributesWithoutApply("TouchAll").apply();
            new Widget(0).hasNoDataForFilter();
            stageName.open().elementsAreLoaded().hasNoRelevantMessage().showAllElementValuesIsVisible(true);
            new Widget(0).hasNoDataForFilter();
        },
    );

    it(
        "can reload elements after selecting delete parent filter",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            stateFilter.open().elementsAreLoaded().selectAttributesWithoutApply("Alabama").apply();
            new Widget(0).hasNoDataForFilter();
            cityFilter
                .open()
                .elementsAreLoaded()
                .hasFilterListSize(5)
                .deleteFiltervaluesBy("State")
                .elementsAreLoaded()
                .hasFilterListSize(300);
        },
    );

    it(
        "can reload elements after removing parent filter",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            stateFilter.open().elementsAreLoaded().selectAttributesWithoutApply("Alabama").apply();
            new Widget(0).hasNoDataForFilter();
            cityFilter.open().elementsAreLoaded().hasFilterListSize(5).close();
            stateFilter.removeFilter();
            table.waitLoadStarted().waitLoaded();
            cityFilter.isLoaded().open().elementsAreLoaded().hasFilterListSize(300);
        },
    );

    it.skip(
        "should test a circle parent - child filter in edit mode",
        { tags: "checklist_integrated_tiger" },
        () => {
            topBar.enterEditMode().editButtonIsVisible(false);
            new InsightsCatalog().waitForCatalogLoad();
            cityFilter.open().elementsAreLoaded().selectAttribute(["Boston", "Nashua"]).apply();
            table.waitLoadStarted().waitLoaded();

            stateFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .configureLimitingParentFilterDependency("City")
                .isLoaded()
                .elementsAreLoaded()
                .hasFilterListSize(2)
                .selectAttribute(["Massachusetts"])
                .apply();
            table.waitLoadStarted().waitLoaded();

            stateFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .hasFilterListSize(2)
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .close();

            stateFilter.open().showAllElementValuesIsVisible(true);
            table.waitLoaded().getColumnValues(1).should("deep.equal", ["Massachusetts"]);
        },
    );

    //This test script cover the bug LX-1123
    it.skip(
        "should not appear blank page after resetting dependent filter",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            stateFilter.isLoaded().open().elementsAreLoaded().selectAttribute(["Connecticut"]).apply();
            table
                .waitLoadStarted()
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", ["Bridgeport", "Hartford"]);
            cityFilter
                .isLoaded()
                .open()
                .elementsAreLoaded()
                .hasValueList(["Bridgeport", "Danbury", "Hartford", "New Haven", "Norwich", "Waterbury"])
                .showAllElementValuesIsVisible(true)
                .showAllElementValues();
            filterBar.resetAllFilters();
            cityFilter.isLoaded().open().elementsAreLoaded().hasFilterListSize(300);
            table
                .waitLoaded()
                .getColumnValues(2)
                .should("deep.equal", [
                    "Bridgeport",
                    "Hartford",
                    "Boston",
                    "Nashua",
                    "New York",
                    "Poughkeepsie",
                    "Portland",
                    "Philadelphia",
                    "Providence",
                ]);
        },
    );
});
