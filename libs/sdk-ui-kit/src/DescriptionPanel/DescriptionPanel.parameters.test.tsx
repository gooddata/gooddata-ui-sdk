// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { DescriptionPanelContent } from "./DescriptionPanel.js";

describe("DescriptionPanelContent", () => {
    it("resolves a parameter reference in the description", async () => {
        render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <DescriptionPanelContent
                        description="Top {parameter/top_n} customers"
                        useReferences
                        parameterDisplayValues={new Map([["top_n", "5"]])}
                    />
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(await screen.findByText("5")).toBeInTheDocument();
    });
});
