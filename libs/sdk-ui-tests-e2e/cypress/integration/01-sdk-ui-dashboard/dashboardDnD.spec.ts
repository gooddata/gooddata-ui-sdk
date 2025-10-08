// (C) 2022-2025 GoodData Corporation

import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { Dashboard } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import { WidgetDropZone } from "../../tools/enum/DropZone";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

const dashboardHeader = new DashboardHeader();
const editMode = new EditMode();
const filterBar = new FilterBar();
const dashboardMenu = new DashboardMenu();
const widget = new Widget(0);
const dashboard = new Dashboard();

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("Dashboard Drag and Drop", { tags: ["pre-merge_isolated_bear"] }, () => {
    describe("Delete attribute filter", () => {
        it("Display trash when performing filter drag", () => {
            Navigation.visit("dashboard/attribute-filtering");
            editMode.edit();

            widget.waitTableLoaded();
            new AttributeFilter("Activity Type").dragFilter().hasDeleteDropzone();
        });

        it("Delete filter when having multiple attribute filters", () => {
            Navigation.visit("dashboard/multiple-filters");
            editMode.edit();

            new AttributeFilter("Account").removeFilter();
            new WidgetConfiguration(0).open().openConfiguration().isFilterItemVisible("Account", false);
        });

        it("Add deleted attribute filter", () => {
            Navigation.visit("dashboard/attribute-filtering");
            editMode.edit();

            new AttributeFilter("Activity Type").removeFilter();
            filterBar.hasAttributeLength(0);

            //wait to stabilize test, 2 DnD actions too fast easily to cause flaky
            cy.wait(1000);
            new FilterBar().addAttribute("Activity Type");
            filterBar.hasAttributeLength(1);
        });
    });

    describe("Reorder widget", () => {
        const widgetsAreLoaded = () => {
            new Widget(0).waitChartLoaded();
            new Widget(1).waitChartLoaded();
            new Widget(2).waitChartLoaded();
        };

        it("(SEPARATE) Insight order after saving", () => {
            Navigation.visit("dashboard/multiple-insights");
            dashboardMenu.toggle();
            dashboardHeader.saveAsNew("Clone");
            editMode.edit();

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 1", "Widget 3", "Widget 2"]);
            dashboard.moveWidget(0, 1, WidgetDropZone.NEXT);

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 3", "Widget 1", "Widget 2"]);

            editMode.save(true);
            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 3", "Widget 1", "Widget 2"]);
        });

        it("Moving insight to first position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 1", "Widget 3", "Widget 2"]);
            dashboard.moveWidget(2, 0, WidgetDropZone.PREV);

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 2", "Widget 1", "Widget 3"]);
        });

        it("Moving insight to last position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 1", "Widget 3", "Widget 2"]);
            dashboard.moveWidget(0, 2, WidgetDropZone.NEXT);

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 3", "Widget 2", "Widget 1"]);
        });

        it("Moving insight to middle position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 1", "Widget 3", "Widget 2"]);
            dashboard.moveWidget(0, 1, WidgetDropZone.NEXT);

            widgetsAreLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 3", "Widget 1", "Widget 2"]);
        });
    });
});
