// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { RichTextWithTooltip } from "./RichTextWithTooltip.js";

describe("RichTextWithTooltip", () => {
    it("marks a restricted reference, like the plain rich text does", async () => {
        // the reference-evaluating hook reaches for a strict backend whether or not references are on
        const { container } = render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <RichTextWithTooltip
                        value="Margin {metric/margin}"
                        renderMode="view"
                        referencesEnabled
                        restrictedReferences={[idRef("margin", "measure")]}
                    />
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(await screen.findByText("restricted")).toBeInTheDocument();
        expect(container.querySelector(".gd-rich-text-metric-restricted")).toBeInTheDocument();
    });
});
