// (C) 2023-2025 GoodData Corporation
import { DateFilter } from "../../tools/dateFilter";
import { EditMode } from "../../tools/editMode";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";

const filterBar = new FilterBar();
const dateFilter = new DateFilter();
const editMode = new EditMode();
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

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
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

        lockedAttributeFilter
            .open()
            .hasDropdownBodyOpen(true)
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .isHiddenIconVisible();
    });

    it("Should not reuse the config mode when re-added attribute filter", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);

        lockedAttributeFilter.isVisible(true).isLockedIconVisible().removeFilter();
        // wait for the filter to be removed, otherwise some mouse drag event closes dropdown of newly added filter before filling attribute name
        cy.wait(500);
        filterBar.addAttribute("Account").isLockedIconVisible(false).isHiddenIconVisible(false);
    });

    it("Should render correct mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("hidden");
        interactiveAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("active");
        hiddenAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("hidden");
        lockedAttributeFilter.open().selectConfiguration(500).hasConfigurationModeCheckedAt("readonly");
    });

    it("Should render correct date filter readonly mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger-readonly-date-filter");
        editMode.edit().saveButtonEnabled(false);

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("readonly");
    });

    it("Use interactive mode as default for date filter mode in configuration overlay", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);

        dateFilter.open().openConfiguration().hasConfigurationModeCheckedAt("active");
    });
});
