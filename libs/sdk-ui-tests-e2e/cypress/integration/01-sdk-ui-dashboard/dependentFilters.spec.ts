// (C) 2023 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { AttributeFilter } from "../../tools/filterBar";
import { TopBar } from "../../tools/dashboards";
import { Table } from "../../tools/table";

const regionFilter = new AttributeFilter("Region");
const stateFilter = new AttributeFilter("State");
const cityFilter = new AttributeFilter("City");
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
            .hasValueList(["Eugene", "Medford", "Portland", "Salem"]);

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
            .configureDependency("Region")
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
            .configureDependency("Region")
            .hasFilterListSize(7)
            .selectAttribute(["Sacramento"])
            .apply()
            .isLoaded()
            .hasSubtitle("Sacramento");

        table.getColumnValues(0).should("deep.equal", ["West Coast"]);
        table.getColumnValues(1).should("deep.equal", ["California"]);
        table.getColumnValues(2).should("deep.equal", ["Sacramento"]);

        topBar.cancelEditMode().discardChanges().editButtonIsVisible(true);

        regionFilter.isLoaded().open().hasSubtitle("East Coast").hasFilterListSize(4);
        stateFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(48);
        cityFilter.isLoaded().open().hasSubtitle("All").hasFilterListSize(287);
    });
});
