// (C) 2022-2025 GoodData Corporation

import { AttributeFilterButtonParentChild } from "../../tools/attributeFilterButtonParentChild";
import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { EditMode } from "../../tools/editMode";
import { DropZone } from "../../tools/enum/DropZone";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { Headline } from "../../tools/headline";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

const PARENT_FILTER_SELECTOR = ".s-attribute-filter.s-product";
const CHILD_FILTER_SELECTOR = ".s-attribute-filter.s-department";

const dashboardHeader = new DashboardHeader();
const editMode = new EditMode();
const filterBar = new FilterBar();
const dashboardMenu = new DashboardMenu();
const activityTypeFilter = new AttributeFilter("Activity Type");
const widget = new Widget(0);

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Dashboard Filtering", { tags: ["pre-merge_isolated_bear"] }, () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("AttributeFilterButton on dashboard (SEPARATE)", () => {
        Navigation.visit("dashboard/filtering");
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline(".s-dash-item.viz-type-headline");

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        headline.waitLoaded().hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .waitElementsLoaded()
            .clearSelection()
            .selectElement(".s-touchall")
            .clickApply();
        parentAttributeFilters
            .getChildFilter()
            .waitFilteringFinished()
            .subtitleHasText("All")
            .open()
            .isAllElementsFilteredByParent();

        headline.waitLoaded().isValue();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip("Headline value changes after filters change (SEPARATE)", () => {
        Navigation.visit("dashboard/filtering");
        const parentAttributeFilters = new AttributeFilterButtonParentChild(
            PARENT_FILTER_SELECTOR,
            CHILD_FILTER_SELECTOR,
        );
        const headline = new Headline(".s-dash-item.viz-type-headline");

        parentAttributeFilters.getParentFilter().titleHasText("Product").subtitleHasText("All");
        parentAttributeFilters.getChildFilter().titleHasText("Department").subtitleHasText("All");

        headline.waitLoaded().hasValue("$38,310,753.45");

        parentAttributeFilters
            .getParentFilter()
            .open()
            .clearSelection()
            .selectElement(".s-compusci")
            .clickApply();

        headline.waitLoaded().hasValue("$9,237,969.87");

        parentAttributeFilters
            .getChildFilter()
            .open()
            .clearSelection()
            .selectElement(".s-direct_sales")
            .clickApply();

        headline.waitLoaded().hasValue("$6,111,808.02");
    });

    it("(SEPARATE) Delete attribute filter", () => {
        Navigation.visit("dashboard/attribute-filtering");
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");
        editMode.edit();

        widget.waitTableLoaded();
        activityTypeFilter.removeFilter();
        widget.waitTableLoaded();
        editMode.save(true);

        filterBar.hasAttributeLength(0);
    });

    it("(SEPARATE) Update values on edit mode after making change on view mode", () => {
        Navigation.visit("dashboard/attribute-filtering");
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");
        filterBar.getAttributeSubTitleViewMode().eq(0).should("have.text", "Email");

        editMode.edit();

        activityTypeFilter.open().selectAllValues().apply();
        editMode.save(true);
        filterBar.getAttributeSubTitleViewMode().eq(0).should("have.text", "All");

        editMode.edit();
        filterBar.getAttributeSubTitleViewMode().eq(0).should("have.text", "All");
    });

    it("Discard changes when editing filter", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();
        filterBar.getAttributeSubTitleViewMode().eq(0).should("have.text", "Email");

        activityTypeFilter.open().selectAttribute(["Phone Call"]).apply();
        editMode.cancel().discard();

        filterBar.getAttributeSubTitleViewMode().eq(0).should("have.text", "Email");
    });

    it("Check attribute filter change value", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();
        activityTypeFilter.open().selectAttribute(["Email", "In Person Meeting", "Phone Call"]);

        filterBar.getSelectionStatus().should("have.text", "Email, In Person Meeting, Phone Call");
    });

    it("Delete attribute filter discarded", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();

        new AttributeFilter("Activity Type").removeFilter();
        editMode.cancel().discard();

        filterBar.hasAttributeFilters(["Activity Type"]);
    });

    it("Expand and collapse filter", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();
        activityTypeFilter.open().close();
    });

    it("Search non existence attribute", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();
        filterBar.dragAttributeToFilterBar().searchAttributeName("No_exist").hasMatchingAttributeName(false);
    });

    it("Search on list of attributes", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();
        filterBar.dragAttributeToFilterBar().searchAttributeName("Stage Name").hasMatchingAttributeName(true);
    });

    it("Verify attribute filter apply button is not disabled", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();

        activityTypeFilter.open().selectAllValues().isApplyButtonEnabled(true);
    });

    it("Verify clear button is applied", () => {
        Navigation.visit("dashboard/attribute-filtering");
        editMode.edit();

        activityTypeFilter.open().clearAllValues().search("Email").isValueSelected("Email", false);
    });

    it("(SEPARATE) Verify selected values should be preserved", () => {
        Navigation.visit("dashboard/attribute-filtering");
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");
        editMode.edit();

        activityTypeFilter.open().selectAllValues().apply();
        editMode.save(true);

        editMode.edit();
        activityTypeFilter
            .open()
            .searchAndSelectFilterItem("Email")
            .searchAndSelectFilterItem("Phone Call")
            .apply();

        activityTypeFilter.open().searchAndSelectFilterItem("Web Meeting").apply();

        activityTypeFilter
            .open()
            .isValueSelected("Email", false)
            .isValueSelected("Phone Call", false)
            .isValueSelected("Web Meeting", false);
    });

    it("Test making no affect on widgets when using unconnected filter", () => {
        Navigation.visit("dashboard/stage-name");
        editMode.edit();

        widget.waitTableLoaded();

        new WidgetConfiguration(0).open().openConfiguration().toggleAttributeFilter("Stage Name").close();

        widget
            .getTable()
            .getColumnValues(0)
            .should("deep.equal", ["Interest", "Discovery", "Short List", "Risk Assessment", "Conviction"]);
    });

    it("(SEPARATE) Apply multiple filters on insight", () => {
        Navigation.visit("dashboard/stage-name");
        dashboardMenu.toggle();
        dashboardHeader.saveAsNew("Clone");
        editMode.edit();

        filterBar.addAttribute("Region").selectAttributeWithoutSearch("East Coast");
        filterBar.addAttribute("Product").selectAttributeWithoutSearch("CompuSci");

        widget.getTable().getColumnValues(0).should("deep.equal", ["Interest", "Short List", "Conviction"]);
        widget
            .getTable()
            .getColumnValues(1)
            .should("deep.equal", ["8,345,333.32", "10,710,741.00", "4,776,667.46"]);
    });

    it("Test adding ignored checkboxes on configuration panel", () => {
        Navigation.visit("dashboard/stage-name");
        editMode.edit();

        filterBar.addAttribute("Region").selectAttributeWithoutSearch("East Coast");
        filterBar.addAttribute("Product").selectAttributeWithoutSearch("CompuSci");

        widget.waitTableLoaded();

        new WidgetConfiguration(0)
            .open()
            .openConfiguration()
            .getListFilterItem()
            .should("deep.equal", ["Stage Name", "Region", "Product"]);
    });

    it("Check attribute filter default state", () => {
        Navigation.visit("dashboard/stage-name");
        editMode.edit();

        filterBar.addAttribute("Region");
        filterBar.getAttributeSubTitle("Region").should("have.text", "All");
    });

    it("Change position attribute filter", () => {
        Navigation.visit("dashboard/stage-name");
        editMode.edit();

        filterBar.addAttribute("Region").close();
        filterBar.addAttribute("Product").close();

        filterBar
            .moveAttributeFilter(0, 1, DropZone.NEXT)
            .getAttributeList()
            .should("deep.equal", ["Region", "Stage Name", "Product"]);

        filterBar
            .moveAttributeFilter(0, 2, DropZone.NEXT)
            .getAttributeList()
            .should("deep.equal", ["Stage Name", "Product", "Region"]);

        filterBar
            .moveAttributeFilter(2, 0, DropZone.PREV)
            .getAttributeList()
            .should("deep.equal", ["Region", "Stage Name", "Product"]);

        filterBar
            .moveAttributeFilter(2, 1, DropZone.PREV)
            .getAttributeList()
            .should("deep.equal", ["Region", "Product", "Stage Name"]);
    });
});
