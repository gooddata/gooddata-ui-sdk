// (C) 2022 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { EditMode } from "../../tools/editMode";
import { AttributeFilter, FilterBar } from "../../tools/filterBar";
import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { WidgetDropZone } from "../../tools/enum/DropZone";
import { Widget } from "../../tools/widget";
import { Dashboard } from "../../tools/dashboards";
import { WidgetConfiguration } from "../../tools/widgetConfiguration";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const dashboardHeader = new DashboardHeader();
const editMode = new EditMode();
const filterBar = new FilterBar();
const dashboardMenu = new DashboardMenu();
const widget = new Widget(0);
const dashboard = new Dashboard();

describe("Dashboard Drag and Drop", { tags: ["pre-merge_isolated_bear"] }, () => {
    beforeEach(() => {
        cy.login();
    });

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
        it("(SEPARATE) Insight order after saving", () => {
            Navigation.visit("dashboard/multiple-insights");
            dashboardMenu.toggle();
            dashboardHeader.saveAsNew("Clone");
            editMode.edit();

            widget.waitChartLoaded();
            dashboard.moveWidget(0, 1, WidgetDropZone.NEXT);

            widget.waitChartLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 2", "Widget 1", "Widget 3"]);

            editMode.save(true);
            widget.waitChartLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 2", "Widget 1", "Widget 3"]);
        });
        it("Moving insight to first position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widget.waitChartLoaded();
            dashboard.moveWidget(2, 0, WidgetDropZone.PREV);
            widget.waitChartLoaded();

            dashboard.getWidgetList().should("deep.equal", ["Widget 3", "Widget 1", "Widget 2"]);
        });

        it("Moving insight to last position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widget.waitChartLoaded();
            dashboard.moveWidget(0, 2, WidgetDropZone.NEXT);

            widget.waitChartLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 2", "Widget 3", "Widget 1"]);
        });

        it("Moving insight to middle position", () => {
            Navigation.visit("dashboard/multiple-insights");
            editMode.edit();

            widget.waitChartLoaded();
            dashboard.moveWidget(0, 1, WidgetDropZone.NEXT);

            widget.waitChartLoaded();
            dashboard.getWidgetList().should("deep.equal", ["Widget 2", "Widget 1", "Widget 3"]);
        });
    });
});
