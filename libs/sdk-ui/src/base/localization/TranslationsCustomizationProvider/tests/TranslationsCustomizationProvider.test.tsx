// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

import { TranslationsCustomizationProvider } from "../TranslationsCustomizationProvider";

const workspace = "testWorkspace";
const getBackend = (enableInsightToReport = true) =>
    recordedBackend(ReferenceRecordings.Recordings, {
        globalSettings: {
            enableInsightToReport,
        },
    });
const messages = {
    "translatedString|insight": "Insight",
    "translatedString|report": "Report",
};

describe("TranslationsCustomizationProvider", () => {
    it("should prepare the translations so there is always used `Insight` when `enableInsightToReport` feature flag is set to false as is by default", async () => {
        const { queryByText } = render(
            <TranslationsCustomizationProvider
                backend={getBackend(false)}
                workspace={workspace}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );
        await waitFor(() => {
            expect(queryByText("Report")).not.toBeInTheDocument();
            expect(queryByText("Insight")).toBeInTheDocument();
        });
    });

    it("should prepare the translations so there is always used `Report` when `enableInsightToReport` feature flag is set to true", async () => {
        const { queryByText } = render(
            <TranslationsCustomizationProvider
                backend={getBackend()}
                workspace={workspace}
                render={(translations) => <div>{translations.translatedString}</div>}
                translations={messages}
            />,
        );
        await waitFor(() => {
            expect(queryByText("Insight")).not.toBeInTheDocument();
            expect(queryByText("Report")).toBeInTheDocument();
        });
    });
});
