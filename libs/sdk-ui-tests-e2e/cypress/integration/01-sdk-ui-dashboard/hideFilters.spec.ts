// (C) 2023-2024 GoodData Corporation
import * as Navigation from "../../tools/navigation";
import { DateFilter } from "../../tools/dateFilter";
import { BubbleTooltip } from "../../tools/bubbleTooltip";
import { EditMode } from "../../tools/editMode";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { InsightsCatalog } from "../../tools/insightsCatalog";

const insightsCatalog = new InsightsCatalog();
const filterBar = new FilterBar();
const dateFilter = new DateFilter();
const editMode = new EditMode();
const bubbleTooltip = new BubbleTooltip();
const interactiveAttributeFilter = new AttributeFilter("Activity");
const hiddenAttributeFilter = new AttributeFilter("City");
const lockedAttributeFilter = new AttributeFilter("Account");

describe("Hide Filters", { tags: ["pre-merge_isolated_tiger"] }, () => {
    it("Hide hidden date filter on view mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.editButtonVisible(true);
        dateFilter.isVisible(false);
    });

    it("Hide hidden attribute filter on view mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.editButtonVisible(true);
        hiddenAttributeFilter.isVisible(false);
    });

    it("User can select hide date filter option on configuration in edit mode", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter
            .isVisible(true)
            .open()
            .openConfiguration()
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
    });

    it("User can select hide attribute filter option on configuration in edit mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
    });

    it("Tooltip hide filter displays on date configuration when hover on hidden option", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter.isVisible(true).open().openConfiguration().hoverOnConfigurationMode("hidden");
        bubbleTooltip.hasTooltip("Dashboard users cannot see the filter but it is applied.");
    });

    it("Tooltip hide filter displays on attribute configuration when hover on hidden option", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .hoverOnConfigurationMode("hidden");
        bubbleTooltip.hasTooltip("Dashboard users cannot see the filter but it is applied.");
    });

    it("Tooltip hide filter displays on edit mode when hover on date filter hidden icon", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter
            .isVisible(true)
            .open()
            .openConfiguration()
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible()
            .hoverOnHiddenIcon();

        bubbleTooltip.hasTooltip("This filter is hidden. It can be accessed only via the Edit mode.");
    });

    it("Tooltip hide filter displays on edit mode when hover on attribute filter hidden icon", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .hoverOnHiddenIcon();

        bubbleTooltip.hasTooltip("This filter is hidden. It can be accessed only via the Edit mode.");
    });

    it("User can not select and edit readonly date filter in view mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-readonly-date-filter");
        dateFilter.open().hasDropdownBodyOpen(false);
    });

    it("User can not select and edit readonly attribute filter in view mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        lockedAttributeFilter.toggle().hasDropdownBodyOpen(false);
    });

    it("User can select and edit readonly date filter in edit mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-readonly-date-filter");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();
        dateFilter
            .open()
            .hasDropdownBodyOpen(true)
            .openConfiguration()
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
    });

    it("User can select and edit readonly attribute filter in edit mode", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        lockedAttributeFilter
            .open()
            .hasDropdownBodyOpen(true)
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
    });

    it("Tooltip locked filter displays on date configuration when hover on locked option", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter.isVisible(true).open().openConfiguration().hoverOnConfigurationMode("readonly");
        bubbleTooltip.hasTooltip("Dashboard users can see the filter but cannot change it.");
    });

    it("Tooltip locked filter displays on attribute configuration when hover on locked option", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .hoverOnConfigurationMode("readonly");
        bubbleTooltip.hasTooltip("Dashboard users can see the filter but cannot change it.");
    });

    it("Tooltip locked filter displays on edit mode when hover on date filter locked icon", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter
            .isVisible(true)
            .open()
            .openConfiguration()
            .selectConfigurationMode("readonly")
            .saveConfiguration()
            .hoverOnLockedIcon();

        bubbleTooltip.hasTooltip("This filter is locked. It can be changed only via the Edit mode.");
    });

    it("Tooltip locked filter displays on edit mode when hover on attribute filter locked icon", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .selectConfigurationMode("readonly")
            .saveConfiguration()
            .hoverOnLockedIcon();

        bubbleTooltip.hasTooltip("This filter is locked. It can be changed only via the Edit mode.");
    });

    it("Tooltip locked filter displays on view mode when hover on date filter locked icon", () => {
        Navigation.visit("dashboard/dashboard-tiger-readonly-date-filter");

        dateFilter.isVisible(true).isLockedIconVisible().hoverOnLockedIcon();

        bubbleTooltip.hasTooltip("This filter is locked.");
    });

    it("Tooltip locked filter displays on view mode when hover on attribute filter locked icon", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");

        lockedAttributeFilter.isVisible(true).isLockedIconVisible().hoverOnLockedIcon();

        bubbleTooltip.hasTooltip("This filter is locked.");
    });

    it("Should not reuse the config mode when re-added attribute filter", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        lockedAttributeFilter.isVisible(true).isLockedIconVisible().removeFilter();

        filterBar.addAttribute("Account").isLockedIconVisible(false).isHiddenIconVisible(false);
    });

    it("Should render correct mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("hidden");
        interactiveAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("active");
        hiddenAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("hidden");
        lockedAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("readonly");
    });

    it("Should render correct date filter readonly mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger-readonly-date-filter");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("readonly");
    });

    it("Use interactive mode as default for date filter mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("active");
    });

    it("Use interactive mode as default for attribute filter mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);
        insightsCatalog.waitForCatalogLoad();

        lockedAttributeFilter.isVisible(true).isLockedIconVisible().removeFilter();
        filterBar
            .addAttribute("Account")
            .isLoaded()
            .selectConfiguration(500)
            .hasConfigurationModeCheckedAt("active");
    });
});
