// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it } from "vitest";

import type { IChatKdaDefinition, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type IInsight, idRef, newBucket, newMeasure } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";
import type { ISlotProps } from "@gooddata/sdk-ui-kit";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setSettingsAction,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { CustomizationProvider } from "../../CustomizationProvider.js";
import type {
    IGenAIAssistantConversationKdaContentProps,
    IGenAIAssistantConversationVisualizationContentProps,
    IGenAIAssistantSlots,
} from "../../customized/types.js";

import { ConversationMultipartContent } from "./ConversationMultipartContent.js";

const MESSAGE: IChatConversationLocalItem = {
    id: "item-1",
    type: "item",
    role: "assistant",
    createdAt: 0,
    content: { type: "multipart", parts: [] },
    localId: "local-1",
    responseId: "response-1",
};

const settings = (): IUserWorkspaceSettings => ({
    userId: "user-1",
    workspace: "ws-1",
    locale: "en-US",
    separators: { thousand: ",", decimal: "." },
    enableBusinessBriefingReportsApp: true,
});

function renderParts(parts: IChatConversationMultipartLocalPart[], slots?: IGenAIAssistantSlots) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    store.dispatch(setSettingsAction({ settings: settings() }));

    return render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                <WorkspaceProvider workspace="ws-1">
                    <CustomizationProvider slots={slots}>
                        <ConversationMultipartContent message={MESSAGE} parts={parts} references={[]} />
                    </CustomizationProvider>
                </WorkspaceProvider>
            </IntlProvider>
        </Provider>,
    );
}

const UNSUPPORTED = "This chart type isn't supported in chat previews.";
const UNAVAILABLE = "Visualization could not be displayed.";

afterEach(cleanup);

describe("ConversationMultipartContent", () => {
    it("shows a document part as a document card next to the text around it", () => {
        renderParts([
            { type: "text", text: "Here is the document." },
            {
                type: "publisherDocument",
                publisherDocument: {
                    type: "report",
                    title: "Quarterly review",
                    periodStart: "2026-01-01",
                    periodEnd: "2026-03-31",
                    content: { version: "1", pages: [] },
                },
            },
        ]);

        expect(screen.getByText("Here is the document.")).toBeTruthy();
        expect(screen.getByText("Quarterly review")).toBeTruthy();
    });

    it("offers to open a document part that changes a saved document", () => {
        renderParts([
            {
                type: "publisherDocument",
                baseDocumentId: "base-1",
                publisherDocument: {
                    type: "report",
                    title: "Quarterly review",
                    periodStart: "2026-01-01",
                    periodEnd: "2026-03-31",
                    content: { version: "1", pages: [] },
                },
            },
        ]);

        expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
    });

    it("says a document part that no longer resolves is unavailable", () => {
        renderParts([{ type: "publisherDocument", publisherDocument: null }]);

        expect(screen.getByText("The document is unavailable.")).toBeTruthy();
    });

    it("renders KDA content through the customization slot", () => {
        const kda = {} as IChatKdaDefinition;
        function CustomKdaContent({ defaultProps }: ISlotProps<IGenAIAssistantConversationKdaContentProps>) {
            return (
                <div data-testid="custom-kda-content">{defaultProps.kda === kda ? "custom KDA" : null}</div>
            );
        }

        renderParts([{ type: "kda", kda }], { ConversationKdaContent: CustomKdaContent });

        expect(screen.getByTestId("custom-kda-content")).toHaveTextContent("custom KDA");
    });

    it.each(["combo_chart", "future_chart"])(
        "says a chart preview of unsupported type %s is not supported",
        (unsupportedChartType) => {
            const { container } = renderParts([
                { type: "visualization", visualization: null, unsupportedChartType },
            ]);

            expect(screen.getByText(UNSUPPORTED)).toBeTruthy();
            expect(screen.queryByText(UNAVAILABLE)).toBeNull();
            expect(container.textContent).not.toContain(unsupportedChartType);
        },
    );

    it.each([
        ["omitted", {}],
        ["null", { unsupportedChartType: null }],
        ["empty", { unsupportedChartType: "" }],
    ])("keeps the generic notice when the chart type is %s", (_description, reason) => {
        renderParts([{ type: "visualization", visualization: null, ...reason }]);

        expect(screen.getByText(UNAVAILABLE)).toBeTruthy();
        expect(screen.queryByText(UNSUPPORTED)).toBeNull();
    });

    it("renders a visualization body even when it names an unsupported type", () => {
        const visualization: IInsight = {
            insight: {
                identifier: "vis-1",
                uri: "/vis-1",
                ref: idRef("vis-1"),
                title: "Net Sales Goal",
                visualizationUrl: "local:bar",
                buckets: [newBucket("measures", newMeasure("m1"))],
                filters: [],
                sorts: [],
                properties: {},
            },
        };
        function CustomVisualizationContent({
            defaultProps,
        }: ISlotProps<IGenAIAssistantConversationVisualizationContentProps>) {
            return (
                <div data-testid="custom-visualization-content">
                    {defaultProps.visualization === visualization ? "custom chart" : null}
                </div>
            );
        }

        renderParts([{ type: "visualization", visualization, unsupportedChartType: "combo_chart" }], {
            ConversationVisualizationContent: CustomVisualizationContent,
        });

        expect(screen.getByTestId("custom-visualization-content")).toHaveTextContent("custom chart");
        expect(screen.queryByText(UNSUPPORTED)).toBeNull();
        expect(screen.queryByText(UNAVAILABLE)).toBeNull();
    });

    it("gives each chart preview without a body its own notice between the text around it", () => {
        const { container } = renderParts([
            { type: "text", text: "First chart:" },
            { type: "visualization", visualization: null, unsupportedChartType: "combo_chart" },
            { type: "visualization", visualization: null },
            { type: "text", text: "Done." },
        ]);

        expect(screen.getAllByText(UNSUPPORTED)).toHaveLength(1);
        expect(screen.getAllByText(UNAVAILABLE)).toHaveLength(1);
        expect(container.textContent).toBe(`First chart:${UNSUPPORTED}${UNAVAILABLE}Done.`);
    });
});
