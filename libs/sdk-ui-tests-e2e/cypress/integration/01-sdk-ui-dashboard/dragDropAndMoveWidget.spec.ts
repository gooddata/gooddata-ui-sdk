// (C) 2023-2026 GoodData Corporation

import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { Dashboard, FilterBar } from "../../tools/dashboards";
import { EditMode } from "../../tools/editMode";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { visit } from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const dashboard = new Dashboard();
const editMode = new EditMode();
const insightCatalog = new InsightsCatalog();

describe("Insight on dashboard", () => {
    beforeEach(() => {
        visit("dashboard/drag-drop-widgets");
        editMode.isInEditMode();
        insightCatalog.waitForCatalogReload();
    });

    it(
        "can add 3 widgets into the same row to create a new section",
        {
            tags: [
                "checklist_integrated_tiger_be",
                "checklist_integrated_tiger_fe",
                "checklist_integrated_tiger_releng_be",
                "checklist_integrated_tiger_releng_fe",
            ],
        },
        () => {
            new DashboardMenu().toggle().hasOption("Save as new");
            new DashboardHeader().saveAsNew("save after drag drop widgets");
            editMode.edit();

            dashboard.getRow(0).addAbove("ComboChart");
            dashboard.hasRowsCount(4);
            dashboard.getWidget(0).waitChartLoaded().hasTitle("Combo chart");

            dashboard.getWidget(0).addBefore("TableWithHyperlinkAttribute");
            dashboard.getRow(0).getItems().should("have.length", 2);

            dashboard.getWidget(1).waitChartLoaded().addBefore("Headline");
            dashboard.getRow(0).getItems().should("have.length", 3);
            dashboard.getWidget(1).hasTitle("Headline").isSelected();

            editMode.save();
            dashboard.hasRowsCount(4);
            dashboard.getRow(0).hasWidgets(3);
        },
    );

    it("shows placeholder text during drag", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        //create a new row, between 2 existing rows
        dashboard.getRow(1).dragAbove("ComboChart");
        dashboard.hasPlaceholderText("Drop to create a new section");
        cy.get(".s-cancel_button").trigger("dragleave");

        //drag to beginning of a row
        dashboard.getWidget(0).dragBefore("TableWithHyperlinkAttribute");
        dashboard.hasDropTargetBorderActive();
        cy.get(".s-cancel_button").trigger("dragleave");

        //drag to the end of a row
        dashboard.getWidget(2).dragAfter("ComboChart");
        dashboard.hasDropTargetBorderActive();
        cy.get(".s-cancel_button").trigger("dragleave");

        //drag to between of 2 widgets
        dashboard.getWidget(0).dragAfter("Headline");
        dashboard.hasDropTargetBorderActive();
    });

    it("can remove widgets after drap&drop", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
        dashboard.getRow(2).scrollIntoView().addLast("ComboChart");
        dashboard.hasRowsCount(4);

        new Widget(0, 3).scrollIntoView().removeVizWidget();
        dashboard.hasRowsCount(3);
    });
});

//Cover ticket: RAIL-4715
describe("Be able to resize widgeton dashboard", () => {
    it(
        "should able to resize widget when is placed next to other in one row",
        {
            tags: [
                "checklist_integrated_tiger_be",
                "checklist_integrated_tiger_fe",
                "checklist_integrated_tiger_releng_be",
                "checklist_integrated_tiger_releng_fe",
            ],
        },
        () => {
            visit("dashboard/insight");
            editMode.edit();
            new FilterBar().clickDateFilter().selectDateFilterOption(".s-all-time").clickApply();
            insightCatalog.waitForCatalogReload();
            dashboard.getWidget(0).add("WithOwnDescription", "prev");
            dashboard.waitItemLoaded();
            dashboard.getWidget(0).hasWidth(4).resizeWidthTo(2).hasWidth(2);
            dashboard.getWidget(1).hasWidth(6).resizeWidthTo(12).hasWidth(10);
        },
    );
});
