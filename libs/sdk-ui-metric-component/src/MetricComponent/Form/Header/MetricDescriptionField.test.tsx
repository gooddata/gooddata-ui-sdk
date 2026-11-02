// (C) 2026 GoodData Corporation

import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { mountWithIntlApp } from "../../../tests/render.test.utils.js";
import { emptyMetric } from "../../metric/emptyMetric.js";
import { TestFormProvider } from "../TestingFormProvider.js";

import { MetricDescriptionField } from "./MetricDescriptionField.js";

function renderDescription({
    description = "Revenue from completed orders.",
    canManageProject = true,
    locked = false,
} = {}) {
    mountWithIntlApp(
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="test">
                <TestFormProvider
                    metric={{ ...emptyMetric, description }}
                    canManageProject={canManageProject}
                    locked={locked}
                >
                    <MetricDescriptionField />
                </TestFormProvider>
            </WorkspaceProvider>
        </BackendProvider>,
    );
}

describe("MetricDescriptionField", () => {
    it.each([
        { canManageProject: false, locked: false },
        { canManageProject: true, locked: true },
    ])("keeps the description read-only for %j", async ({ canManageProject, locked }) => {
        renderDescription({ canManageProject, locked });

        fireEvent.click(await screen.findByText("Revenue from completed orders."));

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(screen.getByText("Revenue from completed orders.")).toBeInTheDocument();
        expect(screen.queryByText(/You can use Markdown/)).not.toBeInTheDocument();
    });

    it.each([
        { canManageProject: false, locked: false },
        { canManageProject: true, locked: true },
    ])("hides an empty read-only description for %j", ({ canManageProject, locked }) => {
        renderDescription({ description: "", canManageProject, locked });

        expect(screen.queryByText("Add description here...")).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("shows the placeholder and allows adding an editable description", async () => {
        renderDescription({ description: "" });

        fireEvent.click(await screen.findByText("Add description here..."));
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "New description" } });
        fireEvent.blur(input);

        expect(await screen.findByText("New description")).toBeInTheDocument();
    });

    it("allows an editable metric's description to change and returns to view mode on blur", async () => {
        renderDescription();

        fireEvent.click(await screen.findByText("Revenue from completed orders."));
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "Updated description" } });
        fireEvent.blur(input);

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(await screen.findByText("Updated description")).toBeInTheDocument();

        fireEvent.click(screen.getByText("Updated description"));

        expect(screen.getByRole("textbox")).toHaveValue("Updated description");
    });
});
