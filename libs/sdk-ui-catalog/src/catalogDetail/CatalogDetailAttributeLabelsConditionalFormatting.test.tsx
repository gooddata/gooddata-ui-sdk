// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ISemanticConditionalFormatting, idRef } from "@gooddata/sdk-model";

import { createLabel } from "../catalogItem/testFixtures.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";

import { CatalogDetailAttributeLabelsConditionalFormatting } from "./CatalogDetailAttributeLabelsConditionalFormatting.js";

const RULE: ISemanticConditionalFormatting = {
    enabled: true,
    conditions: [
        {
            id: "c1",
            operator: "EQUAL_TO",
            value: { kind: "literal", value: "East" },
            format: { scope: "cell" },
        },
    ],
};

const LABELS = [
    createLabel("label.name", "Region Name", { conditionalFormatting: RULE }),
    createLabel("label.primary", "Region (key)", { isPrimary: true }),
];

function renderRow(labels = LABELS) {
    const onChange = vi.fn();
    render(
        <TestIntlProvider>
            <dl>
                <CatalogDetailAttributeLabelsConditionalFormatting
                    labels={labels}
                    canEdit
                    onLabelConditionalFormattingChange={onChange}
                />
            </dl>
        </TestIntlProvider>,
    );
    return onChange;
}

describe("CatalogDetailAttributeLabelsConditionalFormatting", () => {
    it("renders one row listing the labels, primary first, each with its own rule state", () => {
        renderRow();

        expect(screen.getByText("Conditional formatting")).toBeInTheDocument();
        expect(screen.getAllByText(/^Region/).map((el) => el.textContent)).toEqual([
            "Region (key)",
            "Region Name",
        ]);
        expect(screen.getByText("Add rule")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("reports a toggle change for the label it belongs to", () => {
        const onChange = renderRow();

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onChange).toHaveBeenCalledWith(idRef("label.name", "displayForm"), {
            ...RULE,
            enabled: false,
        });
    });

    it("renders nothing without labels", () => {
        renderRow([]);

        expect(screen.queryByText("Conditional formatting")).not.toBeInTheDocument();
    });
});
