// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { InsightsCatalog } from "../../tools/insightsCatalog";
import { LayoutRow } from "../../tools/layoutRow";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { DashboardHeader } from "../../tools/dashboardHeader";

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

        it("can update header for all sections", { tags: ["checklist_integrated_tiger"] }, () => {
            new DashboardMenu().toggle().hasOption("Save as new");
            new DashboardHeader().saveAsNew("save a new dashboard");
            editMode.edit().isInEditMode();
            insightCatalog.waitForCatalogReload();

            cy.fixture("headerDataTest").then((data) => {
                data["DataTest"].forEach((result: { rowIndex: number; sectionName: string }) => {
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
                        new LayoutRow(result.rowIndex).getHeader().hasTitle(false).hasDescription(false);
                    } else {
                        new LayoutRow(result.rowIndex)
                            .getHeader()
                            .hasTitleWithText(result.sectionName)
                            .hasDescriptionWithText(result.sectionName);
                    }
                });
            });
        });

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

    describe("Localization", { tags: ["pre-merge_isolated_tiger"] }, () => {
        beforeEach(() => {
            Navigation.visit("dashboard/header-localization");
            editMode.isInEditMode(false).edit().isInEditMode();
            insightCatalog.waitForCatalogReload();
        });

        it("(SEPARATE) limitation of title, description", () => {
            cy.fixture("headerDataTest").then((data) => {
                const title = data["LimitTexts"].title;
                const desc = data["LimitTexts"].description;
                const headerRow_01 = layoutRow_01.getHeader();
                const headerRow_02 = layoutRow_02.getHeader();
                insightCatalog.waitForCatalogReload();
                headerRow_01.setTitle(title).selectTitleInput().hasLimitMessage("128/256 caractères restant");
                headerRow_02
                    .scrollIntoView()
                    .setDescription(desc)
                    .selectDescriptionInput()
                    .hasLimitMessage("512/1024 caractères restant");

                editMode.save();
                headerRow_01.hasTitleWithText(title);
                headerRow_02.hasDescriptionWithText(desc);
            });
        });

        it("Header placeholder should be translated", () => {
            layoutRow_01
                .getHeader()
                .setTitle(" ")
                .setDescription(" ")
                .hasPlaceholderTitle("Ajouter un titre ici...")
                .hasPlaceholderDescription("Ajouter une description ici...");
        });
    });
});
