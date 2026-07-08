// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IMeasureReferencing } from "@gooddata/sdk-backend-spi";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemMeasure } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { MetricDeleteDialog } from "../MetricDeleteDialog.js";
import { MetricMutationProvider } from "../MetricMutationContext.js";
import type { IMetricMutationPort } from "../metricMutationPort.js";

import { createTestMetricMutationPort } from "./metricMutationPort.test.utils.js";

const measureItem: ICatalogItemMeasure = {
    identifier: "metric.id",
    type: "measure",
    title: "My Metric",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    format: "#,##0.00",
};

function createWrapper(port: IMetricMutationPort) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <ToastsCenterContextProvider>
                    <MetricMutationProvider port={port}>{children}</MetricMutationProvider>
                </ToastsCenterContextProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

function renderDialog(port: IMetricMutationPort) {
    return render(<MetricDeleteDialog item={measureItem} onClose={vi.fn()} onDeleted={vi.fn()} />, {
        wrapper: createWrapper(port),
    });
}

// The confirm dialog renders inside an overlay portal that keeps its buttons out of the role tree,
// so the submit button is reached by its label text and disabled state is read from aria-disabled.
function getDeleteButton(): HTMLButtonElement {
    return screen.getByText("Delete", { selector: "button span, button" }).closest("button")!;
}

describe("MetricDeleteDialog", () => {
    it("keeps the delete action disabled until the usage lookup resolves", async () => {
        let resolveLookup: (referencing: IMeasureReferencing) => void = () => {};
        const port = createTestMetricMutationPort({
            getReferencingObjects: vi.fn().mockReturnValue(
                new Promise<IMeasureReferencing>((resolve) => {
                    resolveLookup = resolve;
                }),
            ),
        });

        renderDialog(port);

        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "true");

        resolveLookup({ insights: [], measures: [] });

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });

    it("surfaces the dependent-object warning once the usage lookup resolves", async () => {
        const port = createTestMetricMutationPort({
            // Only the referencing counts drive the warning, so length-only arrays suffice.
            getReferencingObjects: vi.fn().mockResolvedValue({
                insights: Array.from({ length: 2 }),
                measures: Array.from({ length: 1 }),
            } as IMeasureReferencing),
        });

        renderDialog(port);

        expect(await screen.findByText(/used by 3 objects/)).toBeInTheDocument();
        expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false");
    });

    it("re-enables the delete action when the usage lookup fails so a failed lookup never traps the user", async () => {
        const port = createTestMetricMutationPort({
            getReferencingObjects: vi.fn().mockRejectedValue(new Error("lookup failed")),
        });

        renderDialog(port);

        await waitFor(() => expect(getDeleteButton()).toHaveAttribute("aria-disabled", "false"));
    });
});
