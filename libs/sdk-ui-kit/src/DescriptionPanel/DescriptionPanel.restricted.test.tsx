// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { DescriptionPanelContent } from "./DescriptionPanel.js";

describe("DescriptionPanelContent", () => {
    it("marks a restricted reference in the description", async () => {
        const { container } = render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <DescriptionPanelContent
                        description="Margin {metric/margin}"
                        useReferences
                        restrictedReferences={[idRef("margin", "measure")]}
                    />
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(await screen.findByText("restricted")).toBeInTheDocument();
        expect(container.querySelector(".gd-rich-text-metric-restricted")).toBeInTheDocument();
    });
});
