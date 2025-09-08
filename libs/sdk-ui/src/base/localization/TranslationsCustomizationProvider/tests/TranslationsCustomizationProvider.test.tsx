// (C) 2020-2025 GoodData Corporation
import React from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import { TranslationsCustomizationProvider } from "../TranslationsCustomizationProvider.js";

const workspace = "testWorkspace";
const getBackend = (enableRenamingMeasureToMetric = true) =>
    recordedBackend(ReferenceRecordings.Recordings, {
        globalSettings: {
            enableRenamingMeasureToMetric,
        },
    });

const messages = {
    "translatedString._measure": "Measure",
    "translatedString._metric": "Metric",
};

describe("TranslationsCustomizationProvider", () => {
    it("should use 'Metric' when enableRenamingMeasureToMetric is true (default)", async () => {
        render(
            <TranslationsCustomizationProvider
                backend={getBackend(true)}
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

    it("should use 'Measure' when enableRenamingMeasureToMetric is false", async () => {
        render(
            <TranslationsCustomizationProvider
                backend={getBackend(false)}
                workspace={workspace}
                render={(translations) => <div>{translations["translatedString"]}</div>}
                translations={messages}
            />,
        );
        await waitFor(() => {
            expect(screen.queryByText("Metric")).not.toBeInTheDocument();
            expect(screen.queryByText("Measure")).toBeInTheDocument();
        });
    });
});
