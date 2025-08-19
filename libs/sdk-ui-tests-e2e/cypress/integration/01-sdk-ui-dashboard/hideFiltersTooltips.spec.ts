// (C) 2023-2025 GoodData Corporation
import { BubbleTooltip } from "../../tools/bubbleTooltip";
import { DateFilter } from "../../tools/dateFilter";
import { EditMode } from "../../tools/editMode";
import { AttributeFilter } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";

const dateFilter = new DateFilter();
const editMode = new EditMode();
const bubbleTooltip = new BubbleTooltip();
const interactiveAttributeFilter = new AttributeFilter("Activity");

describe("Hide Filters Tooltips", { tags: ["pre-merge_isolated_tiger"] }, () => {
    it("Tooltip hide filter displays on date configuration when hover on hidden option", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);

        dateFilter.isVisible(true).open().openConfiguration().hoverOnConfigurationMode("hidden");
        bubbleTooltip.hasTooltip("Dashboard users cannot see the filter but it is applied.");
    });

    it("Tooltip hide filter displays on attribute configuration when hover on hidden option", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);

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

        interactiveAttributeFilter
            .isVisible(true)
            .open()
            .selectConfiguration(500)
            .selectConfigurationMode("hidden")
            .saveConfiguration()
            .hoverOnHiddenIcon();

        bubbleTooltip.hasTooltip("This filter is hidden. It can be accessed only via the Edit mode.");
    });

    it("Tooltip locked filter displays on date configuration when hover on locked option", () => {
        Navigation.visit("dashboard/dashboard-tiger");
        editMode.edit().saveButtonEnabled(false);

        dateFilter.isVisible(true).open().openConfiguration().hoverOnConfigurationMode("readonly");
        bubbleTooltip.hasTooltip("Dashboard users can see the filter but cannot change it.");
    });

    it("Tooltip locked filter displays on attribute configuration when hover on locked option", () => {
        Navigation.visit("dashboard/dashboard-tiger-hide-filters");
        editMode.edit().saveButtonEnabled(false);

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

        dateFilter
            .isVisible(true)
            .open()
            .openConfiguration()
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
});
