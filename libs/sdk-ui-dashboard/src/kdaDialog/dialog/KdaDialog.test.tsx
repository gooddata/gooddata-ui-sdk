// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
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

function renderDialog() {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <KdaStateProvider value={state}>
                <KdaDialog onClose={() => undefined} />
            </KdaStateProvider>
        </RawIntlProvider>,
    );
}

describe("KdaDialog", () => {
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
});
