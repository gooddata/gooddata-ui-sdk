// (C) 2021-2024 GoodData Corporation

import * as Navigation from "../../tools/navigation";

import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { CustomURLDialog, WidgetConfiguration } from "../../tools/widgetConfiguration";
import { Messages } from "../../tools/messages";
import { DrillToModal } from "../../tools/drillToModal";
import { getBackend } from "../../support/constants";

const drillModal = new DrillToModal();
const editMode = new EditMode();

describe("Interaction", () => {
    const widget = new Widget(0);
    const widgetConfig = new WidgetConfiguration(0);

    //Cover ticket: RAIL-4559
    it("Should able to remove existing interactions", { tags: ["checklist_integrated_tiger"] }, () => {
        Navigation.visitCopyOf("dashboard/drill-to-insight");
        editMode.edit();
        widget.waitChartLoaded().focus();
        widgetConfig.openInteractions().getDrillConfigItem("Sum of Velocity").remove();
        widgetConfig.getDrillConfigItem("Created - Year").remove();
        editMode.save(true).edit();
        widget.waitChartLoaded().focus();
        widgetConfig.openInteractions().hasInteractionItems(false);
    });

    //Cover ticket: RAIL-4717
    it(
        "Should correctly display attribute list in custom URL dialog",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_bear"] },
        () => {
            Navigation.visit("dashboard/drill-to-insight");
            editMode.edit();
            widget.waitChartLoaded().focus();

            getBackend() === "TIGER"
                ? widgetConfig.openInteractions().getDrillConfigItem("Created - Year").remove()
                : widgetConfig.openInteractions();

            widgetConfig.addInteraction("Sum of Probability", "measure");
            widgetConfig
                .getDrillConfigItem("Sum of Probability")
                .chooseAction("Drill into URL")
                .openCustomUrlEditor();
            new CustomURLDialog().hasItem("Created");
            widgetConfig.closeCustomURLDialog().close();

            const widget2 = new Widget(2);
            const widgetConfig2 = new WidgetConfiguration(2);
            widget2.scrollIntoView().waitChartLoaded().focus();
            widgetConfig2.openInteractions().addInteraction("Sum of Amount", "measure");
            widgetConfig2
                .getDrillConfigItem("Sum of Amount")
                .chooseAction("Drill into URL")
                .openCustomUrlEditor();
            new CustomURLDialog().hasItem("Stage Name");
        },
    );

    //Cover ticket: RAIL-4716
    it(
        "should display correct insight name on invalid interaction warning",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_bear"] },
        () => {
            const widget1 = new Widget(1);
            const message = new Messages();

            Navigation.visit("dashboard/dashboard-many-rows-columns");
            editMode.edit();
            message
                .hasWarningMessage(true)
                .clickShowMore()
                .hasInsightNameIsBolder(true, "Insight has invalid interaction");
            widget1
                .waitChartLoaded()
                .scrollIntoView()
                .focus()
                .setTitle("Visualization has invalid interaction rename");
            message
                .hasWarningMessage(true)
                .clickShowMore()
                .hasInsightNameIsBolder(true, "Visualization has invalid interaction rename");
            widget1.waitChartLoaded().scrollIntoView().focus();
            new WidgetConfiguration(1).removeFromDashboard();
            message.hasWarningMessage(false);
        },
    );
});

describe("Drilling on Table with Metrics in Rows", { tags: ["post-merge_integrated_bear"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/drill-to-insight-metrics-in-rows");
    });

    it("should drill on insight from table with no rows and metrics in rows", () => {
        new Widget(0).getTable().click(0, 1, false);

        drillModal.getTitleElement().should("have.text", "Visualization has invalid interaction");
    });

    it("should drill on insight from table with no columns and metrics in rows", () => {
        new Widget(1).waitTableLoaded().scrollIntoView().getTable().click(1, 2);

        drillModal.getTitleElement().should("have.text", "Sales table");
    });

    it("should drill on insight from table with column headers position left and metrics in rows", () => {
        new Widget(2).scrollIntoView().getTable().click(0, 3, false);

        drillModal.getTitleElement().should("have.text", "With own description");
        drillModal.close();

        new Widget(2).scrollIntoView().getTable().click(1, 3, false);

        drillModal.getTitleElement().should("have.text", "Sales Rep chart");
    });
});
