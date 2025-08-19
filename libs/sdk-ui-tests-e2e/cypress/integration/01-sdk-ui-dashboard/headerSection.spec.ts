// (C) 2023-2025 GoodData Corporation

import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { EditMode } from "../../tools/editMode";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { LayoutRow } from "../../tools/layoutRow";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const editMode = new EditMode();
const insightCatalog = new InsightsCatalog();
const layoutRow_01 = new LayoutRow(0);
const layoutRow_02 = new LayoutRow(1);

describe("Header section", () => {
    describe("Default language", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/header");
            editMode.isInEditMode(false);
        });

        it(
            "can update header for all sections",
            { tags: ["checklist_integrated_tiger", "checklist_integrated_tiger_releng"] },
            () => {
                new DashboardMenu().toggle().hasOption("Save as new");
                new DashboardHeader().saveAsNew("save a new dashboard");
                editMode.edit().isInEditMode();
                insightCatalog.waitForCatalogReload();

                cy.fixture("headerDataTest").then((data) => {
                    data["DataTest"].forEach((result: { rowIndex: number; sectionName: string }) => {
                        cy.scrollTo("bottom");
                        new LayoutRow(result.rowIndex)
                            .getHeader()
                            .setTitle(result.sectionName)
                            .setDescription(result.sectionName);
                    });
                });

                editMode.save(); //save all headers after input

                cy.fixture("headerDataTest").then((data) => {
                    data["DataTest"].forEach((result: { rowIndex: number; sectionName: string }) => {
                        if (result.rowIndex === 0) {
                            new LayoutRow(result.rowIndex)
                                .getHeader()
                                .hasTitle(false)
                                .hasDescriptionWithText("");
                        } else {
                            new LayoutRow(result.rowIndex)
                                .getHeader()
                                .hasTitleWithText(result.sectionName)
                                .hasDescriptionWithText(result.sectionName);
                        }
                    });
                });
            },
        );

        it(
            "Header is removed after latest insight is deleted from a section",
            { tags: ["pre-merge_isolated_tiger"] },
            () => {
                editMode.edit().isInEditMode();
                insightCatalog.waitForCatalogReload();
                layoutRow_01.hasCountOfHeaderSection(3);
                new Widget(0).removeVizWidget();

                layoutRow_01.hasCountOfHeaderSection(2);
            },
        );
    });

    describe("Localization", () => {
        beforeEach(() => {
            Navigation.visit("dashboard/header-localization");
            editMode.isInEditMode(false).edit().isInEditMode();
            insightCatalog.waitForCatalogReload();
        });

        //Cover ticket: RAIL-4674
        it("Limitation of title", { tags: ["checklist_integrated_tiger"] }, () => {
            cy.fixture("headerDataTest").then((data) => {
                const title = data["LimitTexts"].title;
                const desc = data["LimitTexts"].description;
                const headerRow_01 = layoutRow_01.getHeader();
                const headerRow_02 = layoutRow_02.getHeader();
                insightCatalog.waitForCatalogReload();
                headerRow_01
                    .setTitle(title)
                    .selectTitleInput()
                    .hasLimitMessage(true, "128/256 caractères restant")
                    .clickOutside()
                    .hasLimitMessage(false, "128/256 caractères restant");
                headerRow_02.scrollIntoView().setDescription(desc).selectDescriptionInput().clickOutside();

                editMode.save();
                headerRow_01.hasTitleWithText(title);
                headerRow_02.hasDescriptionWithText(desc);
            });
        });

        it("Header placeholder should be translated", { tags: ["pre-merge_isolated_tiger"] }, () => {
            layoutRow_01
                .getHeader()
                .setTitle(" ")
                .setDescription(" ")
                .hasPlaceholderTitle("Ajouter un titre ici...")
                .hasPlaceholderDescription("Ajouter une description ici...");
        });
    });
});
