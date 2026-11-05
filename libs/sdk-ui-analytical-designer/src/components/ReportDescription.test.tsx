// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalDesignerVisualizationDescriptionProps } from "../embedding/editorHeaderSlotTypes.js";
import { withIntl } from "../utils/with_intl.js";

import { DefaultVisualizationDescription } from "./ReportDescription.js";

function renderDescription(props: Partial<IAnalyticalDesignerVisualizationDescriptionProps>) {
    const Wrapped = withIntl(DefaultVisualizationDescription);
    const { container } = render(
        <Wrapped
            layout={{ mode: "legacy", isCatalogCollapsed: false, canCollapseCatalog: false }}
            workspace="workspace"
            title=""
            hasUnsavedChanges={false}
            description=""
            addLabel="Add description"
            placeholder="Add description"
            isEditable
            filters={[]}
            onDescriptionChange={vi.fn()}
            {...props}
        />,
    );
    return container;
}

describe("DefaultVisualizationDescription", () => {
    it("offers to add a description that can be changed", () => {
        const container = renderDescription({ isEditable: true });
        expect(container.querySelector(".s-adi-description-tooltip-icon")).toBeInTheDocument();
    });

    it("shows a description that cannot be changed", () => {
        const container = renderDescription({ isEditable: false, description: "About" });
        expect(container.querySelector(".s-adi-description-tooltip-icon")).toBeInTheDocument();
    });

    it("renders nothing for an empty description that cannot be changed", () => {
        const container = renderDescription({ isEditable: false, description: "  " });
        expect(container).toBeEmptyDOMElement();
    });
});
