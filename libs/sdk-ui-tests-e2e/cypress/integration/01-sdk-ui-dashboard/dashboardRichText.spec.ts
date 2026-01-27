// (C) 2021-2026 GoodData Corporation

import { DashboardHeader } from "../../tools/dashboardHeader";
import { DashboardMenu } from "../../tools/dashboardMenu";
import { EditMode } from "../../tools/editMode";
import { LayoutRow } from "../../tools/layoutRow";
import { visit } from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const editMode = new EditMode();
const widget = new Widget(0, 1);
const addedWidget = new Widget(0);
const header = new DashboardHeader();
const layoutRow = new LayoutRow(0);
const dashboardMenu = new DashboardMenu();

describe("RichText - isolated", { tags: ["pre-merge_isolated_tiger_fe"] }, () => {
    beforeEach(() => {
        visit("dashboard/rich-text");
    });

    it("should render rich text in view mode", () => {
        const richText = widget.getRichText();
        richText.exist();

        richText.getContentElement().find("h1").should("exist").should("have.text", "Title");
        richText.getContentElement().find("img").should("exist").should("have.attr", "src", "/image.png");
    });

    it("should change rich text widget content in edit mode", () => {
        editMode.edit();

        const richText = widget.getRichText();
        richText.exist();

        richText.updateContent("\n## Update");
        richText.confirmChanges().isView();
        richText.getContentElement().find("h2").should("exist").should("have.text", "Update");
    });

    it("should remove rich text widget in edit mode", () => {
        editMode.edit();
        widget.getRichText().remove().notExist();
    });
});

describe(
    "RichText - integrated",
    {
        tags: [
            "checklist_integrated_tiger_be",
            "checklist_integrated_tiger_fe",
            "checklist_integrated_tiger_releng_be",
            "checklist_integrated_tiger_releng_fe",
        ],
    },
    () => {
        beforeEach(() => {
            visit("dashboard/rich-text");
        });

        it("should remove rich text widget and save it", () => {
            editMode.edit();
            widget.getRichText().remove();
            dashboardMenu.toggle();
            header.saveAsNew("RichText With Removed Widget");
            widget.getRichText().notExist();
        });

        it("should add rich text widget and save it", () => {
            editMode.edit();

            layoutRow.addRichTextWidget();
            const addedRichText = addedWidget.getRichText();
            addedRichText.exist();
            addedRichText.updateContent("# Title 2\n\n![Image2](/image2.png)").confirmChanges();

            dashboardMenu.toggle();
            header.saveAsNew("RichText With Added Widget");

            addedRichText
                .getContentElement()
                .find("img")
                .should("exist")
                .should("have.attr", "src", "/image2.png");
            addedRichText.getContentElement().find("h1").should("exist").should("have.text", "Title 2");
        });
    },
);
