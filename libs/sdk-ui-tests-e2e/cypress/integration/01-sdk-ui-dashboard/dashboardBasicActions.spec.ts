// (C) 2023 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";
import { EditMode } from "../../tools/editMode";
import { TopBar } from "../../tools/dashboards";
import { LayoutRow } from "../../tools/layoutRow";

const editMode = new EditMode();
const widget = new Widget(0);
const layout = new LayoutRow(0);

describe("Basic actions on dashboard", { tags: ["pre-merge_isolated_tiger"] }, () => {
    beforeEach(() => {
        Navigation.visit("dashboard/insight");
        editMode.edit().isInEditMode();
    });

    it("can discard change an existing dashboard", () => {
        widget.waitChartLoaded();
        layout.hasWidgets(1);

        widget.removeVizWidget();
        editMode.cancel().discard();

        new TopBar().editButtonIsVisible();
        layout.hasWidgets(1);
    });

    it("cancel dashboard by clicking on close button", () => {
        widget.waitChartLoaded().removeVizWidget();

        editMode.cancel().closeDiscardChange().isInEditMode();
    });
});
