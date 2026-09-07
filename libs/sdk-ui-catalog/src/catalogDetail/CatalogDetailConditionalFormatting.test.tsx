// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ISemanticConditionalFormatting } from "@gooddata/sdk-model";

import { TestIntlProvider } from "../localization/TestIntlProvider.js";

import { CatalogDetailConditionalFormatting } from "./CatalogDetailConditionalFormatting.js";

const RULE: ISemanticConditionalFormatting = {
    conditions: [
        {
            id: "c1",
            operator: "GREATER_THAN",
            value: { kind: "literal", value: 100 },
            format: { scope: "cell", color: "#ff0000" },
        },
    ],
};

function renderRow(
    conditionalFormatting: ISemanticConditionalFormatting | undefined,
    onConditionalFormattingChange = vi.fn(),
    canEdit = true,
) {
    render(
        <TestIntlProvider>
            <CatalogDetailConditionalFormatting
                identifier="metric.id"
                title="Revenue"
                conditionalFormatting={conditionalFormatting}
                canEdit={canEdit}
                onConditionalFormattingChange={onConditionalFormattingChange}
            />
        </TestIntlProvider>,
    );
    return { onConditionalFormattingChange };
}

describe("CatalogDetailConditionalFormatting — row states", () => {
    it("shows 'Add rule' and no toggle when there is no rule", () => {
        renderRow(undefined);
        expect(screen.getByText("Add rule")).toBeInTheDocument();
        expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("shows a checked toggle and 'Edit' when a rule exists and is enabled", () => {
        renderRow(RULE);
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("shows an unchecked toggle when a rule exists but enabled is explicitly false", () => {
        renderRow({ ...RULE, enabled: false });
        expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("treats an existing rule with enabled absent as on (defaults to true)", () => {
        renderRow(RULE);
        expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("disables the toggle and the edit link when canEdit is false", () => {
        renderRow(RULE, undefined, false);
        expect(screen.getByRole("checkbox")).toBeDisabled();
        expect(screen.getByText("Edit").closest("button")).toBeDisabled();
    });
});

describe("CatalogDetailConditionalFormatting — toggling", () => {
    it("flips enabled without touching the stored conditions when toggled off", () => {
        const { onConditionalFormattingChange } = renderRow(RULE);

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onConditionalFormattingChange).toHaveBeenCalledWith({ ...RULE, enabled: false });
    });

    it("flips enabled back on from a disabled rule", () => {
        const { onConditionalFormattingChange } = renderRow({ ...RULE, enabled: false });

        fireEvent.click(screen.getByRole("checkbox"));

        expect(onConditionalFormattingChange).toHaveBeenCalledWith({ ...RULE, enabled: true });
    });
});
