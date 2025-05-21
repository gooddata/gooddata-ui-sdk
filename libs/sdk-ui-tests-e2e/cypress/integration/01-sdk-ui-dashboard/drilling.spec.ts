// (C) 2021-2025 GoodData Corporation

import * as Navigation from "../../tools/navigation";

import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { CustomURLDialog, WidgetConfiguration } from "../../tools/widgetConfiguration";
import { Messages } from "../../tools/messages";
import { DrillToModal } from "../../tools/drillToModal";

const drillModal = new DrillToModal();
const editMode = new EditMode();

describe("Interaction", () => {
    const widget = new Widget(0);
    const widgetConfig = new WidgetConfiguration(0);

    //Cover ticket: RAIL-4559
    it(
        "Should able to remove existing interactions",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visitCopyOf("dashboard/drill-to-insight");
            editMode.edit();
            widget.waitChartLoaded().focus();
            widgetConfig.openInteractions().getDrillConfigItem("Created - Year").remove();
            widgetConfig.getDrillConfigItem("Sum of Velocity").remove();
            editMode.save(true).edit();
            widget.waitChartLoaded().focus();
            widgetConfig.openInteractions().hasInteractionItems(false);
        },
    );

    //Cover ticket: RAIL-4717
    it(
        "Should correctly display attribute list in custom URL dialog",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
        () => {
            Navigation.visit("dashboard/drill-to-insight");
            editMode.edit();
            widget.waitChartLoaded().focus();

            widgetConfig.openInteractions().getDrillConfigItem("Created - Year").remove();
            widgetConfig.getDrillConfigItem("Sum of Velocity").remove();

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
        { tags: ["checklist_integrated_tiger"] },
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

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip("Drilling on Table with Metrics in Rows", { tags: ["post-merge_integrated_bear"] }, () => {
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
