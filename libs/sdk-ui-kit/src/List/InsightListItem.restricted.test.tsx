// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, IntlWrapper, WorkspaceProvider } from "@gooddata/sdk-ui";

import { InsightListItem } from "./InsightListItem.js";

describe("InsightListItem", () => {
    it("marks a restricted reference in the description it opens", async () => {
        const { container } = render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <IntlWrapper>
                        <InsightListItem
                            title="Revenue"
                            description="Margin {metric/margin}"
                            showDescriptionPanel
                            useReferences
                            restrictedReferences={[idRef("margin", "measure")]}
                        />
                    </IntlWrapper>
                </WorkspaceProvider>
            </BackendProvider>,
        );

        fireEvent.mouseEnter(container.querySelector(".gd-bubble-trigger")!);

        expect(await screen.findByText("restricted")).toBeInTheDocument();
    });
});
