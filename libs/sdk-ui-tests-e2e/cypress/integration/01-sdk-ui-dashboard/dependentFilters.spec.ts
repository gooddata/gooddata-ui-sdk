// (C) 2023-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilter } from "../../tools/filterBar";
import { TopBar } from "../../tools/dashboards";
import { Table } from "../../tools/table";

const regionFilter = new AttributeFilter("Region");
const stateFilter = new AttributeFilter("State");
const cityFilter = new AttributeFilter("City");
const product = new AttributeFilter("Product");
const stageName = new AttributeFilter("Stage Name");
const table = new Table(".s-dash-item-0");
const topBar = new TopBar();

describe("Dependent filter", () => {
    beforeEach(() => {
        Navigation.visit("dashboard/dashboard-dependent-filters");
    });

    it("should test parent - child interaction in view mode", { tags: "pre-merge_isolated_tiger" }, () => {
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

        table.waitLoaded().getColumnValues(2).should("deep.equal", ["Bridgeport", "Hartford"]);

        cityFilter
            .isLoaded()
            .open()
            .hasSubtitle("All")
            .hasFilterListSize(6)
            .hasSelectedValueList(["Bridgeport", "Danbury", "Hartford", "New Haven", "Norwich", "Waterbury"])
            .hasValueList(["Bridgeport", "Danbury", "Hartford", "New Haven", "Norwich", "Waterbury"])
            .showAllElementValuesIsVisible(true)
            .showAllElementValues()
            .showAllElementValuesIsVisible(false)
            .hasFilterListSize(287)
            .selectAttribute(["Hartford"])
            .apply()
            .isLoaded()
            .hasSubtitle("Hartford");

        table.waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);

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
            .hasFilterListSize(287)
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

        cityFilter.open().hasSubtitle("Hartford").hasFilterListSize(10).hasSelectedValueList(["Hartford"]);

        table.waitLoaded().getColumnValues(2).should("deep.equal", ["Hartford"]);
    });

    it("should test parent - child interaction in edit mode", { tags: "pre-merge_isolated_tiger" }, () => {
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
        cityFilter
            .open()
            .hasSubtitle("All")
            .hasFilterListSize(50)
            .configureLimitingParentFilterDependency("Region")
            .hasFilterListSize(7)
            .selectAttribute(["Sacramento"])
            .apply()
            .isLoaded()
            .hasSubtitle("Sacramento");

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

        regionFilter.isLoaded().open().hasSubtitle("East Coast").hasFilterListSize(4);
        stateFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(48);
        cityFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(287);
    });

    it(
        "child filter can reduce to zero element by parent filter",
        { tags: "checklist_integrated_tiger" },
        () => {
            cy.intercept("GET", "**/attributes**").as("attributes");
            topBar.enterEditMode().editButtonIsVisible(false);
            product.open().selectAttributesWithoutApply("TouchAll").apply();
            cy.wait("@attributes").then(() => {
                stageName
                    .open()
                    .elementsAreLoaded()
                    .hasNoRelevantMessage()
                    .showAllElementValuesIsVisible(true);
            });
            table.isEmpty();
        },
    );

    it("can reload elements after unchecking parent filter", { tags: "checklist_integrated_tiger" }, () => {
        topBar.enterEditMode().editButtonIsVisible(false);
        stateFilter.open().selectAttributesWithoutApply("Alabama").apply();
        cityFilter
            .open()
            .elementsAreLoaded()
            .hasFilterListSize(5)
            .configureLimitingParentFilterDependency("State")
            .elementsAreLoaded()
            .hasFilterListSize(287);
    });

    it("can reload elements after removing parent filter", { tags: "checklist_integrated_tiger" }, () => {
        cy.intercept("GET", "**/attributes**").as("attributes");
        topBar.enterEditMode().editButtonIsVisible(false);
        stateFilter.open().selectAttributesWithoutApply("Alabama").apply();
        cy.wait("@attributes").then(() => {
            cityFilter.open().elementsAreLoaded().hasFilterListSize(5).close();
            stateFilter.removeFilter();
            cityFilter.isLoaded().open().elementsAreLoaded().hasFilterListSize(287);
        });
    });

    it(
        "should test a circle parent - child filter in edit mode",
        { tags: "checklist_integrated_tiger" },
        () => {
            cy.intercept("GET", "**/attributes**").as("attributes");

            topBar.enterEditMode().editButtonIsVisible(false);
            cy.wait("@attributes").then(() => {
                cityFilter.open().selectAttribute(["Portland"]).apply();
            });

            stateFilter
                .open()
                .elementsAreLoaded()
                .configureLimitingParentFilterDependency("City")
                .hasFilterListSize(2)
                .selectAttribute(["Oregon"])
                .apply();

            stateFilter
                .open()
                .hasFilterListSize(2)
                .showAllElementValuesIsVisible(true)
                .showAllElementValues()
                .close();

            stateFilter.open().showAllElementValuesIsVisible(true);
            table.waitLoaded().getColumnValues(1).should("deep.equal", ["Oregon"]);
        },
    );
});
