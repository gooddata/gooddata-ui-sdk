// (C) 2021 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Table } from "../../tools/table";
import { Widget } from "../../tools/widget";
import { DrillToModal } from "../../tools/drillToModal";
import { getBackend, getHost, getProjectId } from "../../support/constants";
import { EditMode } from "../../tools/editMode";
import { CustomURLDialog, WidgetConfiguration } from "../../tools/widgetConfiguration";

//!!!!!!!!!!! this constant could be shifted check gray pages if test failed before each or after hook
const DEPARTMENT_ID = "1090";
//!!!!!!!!!!! this constant could be shifted check gray pages if test failed before each or after hook
const PRODUCT_ID = "1056";
const drillModal = new DrillToModal();
const editMode = new EditMode();

/**
 *
 * This method is getting data from bear if this failed one reason could be that data are shifted
 * If test failed in before each or after each hook DEPARTMENT_ID, PRODUCT_ID could be shifted
 * @returns
 */
const postDrillDownStepAttributeDF = (value?: string) => {
    if (getBackend() !== "BEAR") {
        return;
    }
    const uri = `/gdc/md/${getProjectId()}/obj/${DEPARTMENT_ID}`;
    const url = `${getHost()}${uri}`;
    const headers = { accept: "application/json" };

    cy.request({ method: "GET", url, headers }).then((getResponse) => {
        cy.wrap(getResponse.status).should("equal", 200);
        cy.wrap(getResponse.body?.attribute?.meta?.uri).should("equal", uri);
        cy.wrap(getResponse.body?.attribute?.content).should("exist");

        const body = {
            ...getResponse.body,
            attribute: {
                ...getResponse.body.attribute,
                content: {
                    ...getResponse.body.attribute.content,
                    drillDownStepAttributeDF: value,
                },
            },
        };

        cy.request({ method: "POST", url, headers, body }).then((postResponse) => {
            cy.wrap(postResponse.status).should("equal", 200);
            cy.wrap(postResponse.body?.uri).should("equal", uri);
        });
    });
};

describe("Drilling", { tags: ["post-merge_integrated_bear"] }, () => {
    before(() => {
        // Sets drilling on Department attribute into Product attribute
        postDrillDownStepAttributeDF(`/gdc/md/${getProjectId()}/obj/${PRODUCT_ID}`);
    });

    after(() => {
        // Removes drilling from Department attribute
        postDrillDownStepAttributeDF();
    });

    describe("implicit drill to attribute url", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/implicit-drill-to-attribute-url");
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });

        // eslint-disable-next-line jest/no-disabled-tests
        it.skip("should drill to correct url after clicking on attribute in drill modal", () => {
            const table = new Table(".s-dash-item");

            table.click(0, 1);

            const drillModalTable = new Table(".s-drill-modal-dialog");

            drillModalTable.click(0, 0);

            cy.get(".s-attribute-url").should(
                "have.text",
                "https://www.google.com/search?q=.decimal%20%3E%20Explorer",
            );
        });
    });

    describe("Advanced drill down", () => {
        it("Drill down on column with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            new Widget(2).waitTableLoaded().getTable().click(0, 0);

            drillModal.getChart().waitLoaded().clickSeriesPoint(0);
            drillModal
                .getTitleElement()
                .should("have.text", "Bar chart with measures and attribute › Direct Sales");
        });

        it("Drill down on table with one drillable on drill to insight", () => {
            Navigation.visit("dashboard/drill-to-insight");
            new Widget(3).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(0, 7);

            drillModal.getTable().click(0, 1);
            drillModal
                .getTitleElement()
                .should("have.text", "Table Activity by Year and Department › Inside Sales");
        });

        it("Drill down on table with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(0).waitTableLoaded().getTable().click(0, 1);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Drill down on column chart with invalid drill", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(1).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(0, 0);

            drillModal.getModalText().should("have.text", "Sorry, we can't display this insight");
        });

        it("Check attribute value when drilling in bubble chart", () => {
            Navigation.visit("dashboard/dashboard-target");
            new Widget(2).scrollIntoView().waitChartLoaded().getChart().waitLoaded().clickSeriesPoint(1, 0);

            drillModal.getTable().getColumnValues(0).should("deep.equal", ["2011"]);
        });
    });
});

describe("Interaction", () => {
    const widget = new Widget(0);
    const widgetConfig = new WidgetConfiguration(0);

    beforeEach(() => {
        Navigation.visit("dashboard/drill-to-insight");
    });

    //Cover ticket: RAIL-4559
    it("Should able to remove existing interactions", { tags: ["checklist_integrated_tiger"] }, () => {
        Navigation.visitCopyOf("dashboard/drill-to-insight");
        editMode.edit();
        widget.waitChartLoaded().focus();
        widgetConfig.openInteractions().getDrillConfigItem("Sum of Velocity").remove();
        editMode.save(true).edit();
        widget.waitChartLoaded().focus();
        widgetConfig.openInteractions().hasInteractionItems(false);
    });

    //Cover ticket: RAIL-4717
    it(
        "Should correctly display attribute list in custom URL dialog",
        { tags: ["checklist_integrated_tiger", "checklist_integrated_bear"] },
        () => {
            editMode.edit();
            widget.waitChartLoaded().focus();
            widgetConfig.openInteractions().addInteraction("Sum of Probability", "measure");
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
});
