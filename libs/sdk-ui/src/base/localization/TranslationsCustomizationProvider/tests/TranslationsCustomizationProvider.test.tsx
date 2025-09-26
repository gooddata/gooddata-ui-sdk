// (C) 2020-2025 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import { TranslationsCustomizationProvider } from "../TranslationsCustomizationProvider.js";

const workspace = "testWorkspace";
const backend = recordedBackend(ReferenceRecordings.Recordings);

const messages = {
    "translatedString._measure": "Measure",
    "translatedString._metric": "Metric",
};

describe("TranslationsCustomizationProvider", () => {
    it("should use 'Metric'", async () => {
        render(
            <TranslationsCustomizationProvider
                backend={backend}
                workspace={workspace}
                render={(translations) => <div>{translations["translatedString"]}</div>}
                translations={messages}
            />,
        );
        await waitFor(() => {
            expect(screen.queryByText("Measure")).not.toBeInTheDocument();
            expect(screen.queryByText("Metric")).toBeInTheDocument();
        });
    });
});
