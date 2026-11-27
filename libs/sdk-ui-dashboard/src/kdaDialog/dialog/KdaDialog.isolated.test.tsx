// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { createInternalIntl } from "../../presentation/localization/createInternalIntl.js";
import { type IKdaState } from "../internalTypes.js";
import { KdaStateProvider } from "../providers/KdaState.js";

import { KdaDialog } from "./KdaDialog.js";

vi.mock("./hooks/useChangeAnalysis.js", () => ({ useChangeAnalysis: () => undefined }));
vi.mock("./hooks/useValidAttributes.js", () => ({ useValidAttributes: () => undefined }));
vi.mock("../../model/react/DashboardStoreProvider.js", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useDashboardSelector: () => false,
}));
vi.mock("../composition/MetricsBar.js", () => ({ MetricsBar: () => null }));
vi.mock("../composition/FiltersBar.js", () => ({ FiltersBar: () => null }));
vi.mock("../components/KdaContent.js", () => ({ KdaContent: () => null }));
vi.mock("../components/KdaFooter.js", () => ({ KdaFooter: () => null }));

const state = {
    isMinimized: false,
    definitionStatus: "success",
    definition: { metric: { measure: { title: "Sum of Activity (Date)" } } },
} as unknown as Partial<IKdaState>;

const minimizedDoneState = {
    ...state,
    isMinimized: true,
    relevantStatus: "success",
    itemsStatus: "success",
    selectedStatus: "success",
} as unknown as Partial<IKdaState>;

const minimizedLoadingState = {
    ...minimizedDoneState,
    itemsStatus: "loading",
} as unknown as Partial<IKdaState>;

function dialogTree(value: Partial<IKdaState>) {
    return (
        <RawIntlProvider value={createInternalIntl()}>
            <KdaStateProvider value={value}>
                <KdaDialog onClose={() => undefined} />
            </KdaStateProvider>
        </RawIntlProvider>
    );
}

function renderDialog(value: Partial<IKdaState> = state) {
    return render(dialogTree(value));
}

describe("KdaDialog", () => {
    it("presents the expanded view as a newly entered dialog, not the reused minimized one", async () => {
        const { rerender } = render(dialogTree({ ...state, isMinimized: true }));
        const minimized = screen.getByTestId("kda-dialog-minimized");

        rerender(dialogTree({ ...state, isMinimized: false }));

        const expanded = await screen.findByTestId("kda-dialog-expanded");
        expect(expanded).not.toBe(minimized);
        expect(minimized).not.toBeInTheDocument();
        expect(screen.queryByTestId("kda-dialog-minimized")).not.toBeInTheDocument();
        expect(expanded).toHaveAttribute("role", "dialog");
        expect(expanded).toHaveAttribute("aria-modal", "true");
        const title = screen.getByText("Key driver analysis for Sum of Activity (Date)");
        expect(expanded).toHaveAttribute("aria-labelledby", title.id);
    });

    it("names the expanded dialog by its visible title", () => {
        renderDialog();

        const dialog = screen.getByTestId("kda-dialog-expanded");
        const title = screen.getByText("Key driver analysis for Sum of Activity (Date)");

        expect(dialog).toHaveAttribute("role", "dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(title.id).not.toBe("");
        expect(dialog).toHaveAttribute("aria-labelledby", title.id);
        expect(dialog).not.toHaveAttribute("aria-describedby");
    });

    it("does not repeat the dialog title as the description of the header controls", () => {
        renderDialog();

        // The overlay is not positioned in jsdom, so its content counts as hidden for role queries.
        const minimize = screen.getByTestId("minimize");
        const close = screen.getByTestId("close_the_analysis");

        expect(minimize).toHaveAttribute("aria-label", "Minimize");
        expect(close).toHaveAttribute("aria-label", "Close the analysis");
        expect(minimize).not.toHaveAttribute("aria-describedby");
        expect(close).not.toHaveAttribute("aria-describedby");
    });

    it("focuses the Open button of the minimized dialog, not the status text", async () => {
        renderDialog(minimizedDoneState);

        const dialog = screen.getByTestId("kda-dialog-minimized");
        const open = screen.getByTestId("open");
        const statusText = screen.getByText("Analysis is ready");
        const label = screen.getByText("Key driver analysis for Sum of Activity (Date)");

        await waitFor(() => expect(open).toHaveFocus());

        expect(statusText).not.toHaveAttribute("tabindex");
        expect(dialog).toHaveAttribute("aria-labelledby", label.id);
        expect(dialog).toHaveAttribute("aria-describedby", statusText.id);
        expect(open).toHaveAttribute("aria-describedby", `${label.id} ${statusText.id}`);
    });

    it("moves focus from the expand button to the Open button when the analysis finishes", async () => {
        const { rerender } = renderDialog(minimizedLoadingState);

        const expand = await screen.findByRole("button", { name: "Expand to a dialog" });
        await waitFor(() => expect(expand).toHaveFocus());

        rerender(dialogTree(minimizedDoneState));

        // Focus must move to the Open button in the same update, never passing through the page body,
        // so screen readers do not re-enter (and re-announce) the dialog.
        expect(expand).not.toBeInTheDocument();
        expect(screen.getByTestId("open")).toHaveFocus();
    });

    it("does not take focus from outside the dialog when the analysis finishes", async () => {
        const outside = document.createElement("button");
        document.body.appendChild(outside);
        const { rerender } = renderDialog(minimizedLoadingState);

        await waitFor(() => expect(screen.getByRole("button", { name: "Expand to a dialog" })).toHaveFocus());
        outside.focus();

        rerender(dialogTree(minimizedDoneState));

        expect(screen.getByTestId("open")).toBeInTheDocument();
        expect(outside).toHaveFocus();
        outside.remove();
    });
});
