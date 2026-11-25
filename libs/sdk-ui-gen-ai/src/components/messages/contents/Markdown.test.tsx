// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { type CatalogItem } from "@gooddata/sdk-model";

import { en_US } from "../../../localization/bundles/en-US.localization-bundle.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    setCatalogItemsActions,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";
import { ConfigProvider } from "../../ConfigContext.js";
import { escapeMarkdown } from "../../utils/markdownUtils.js";

import { MarkdownComponent } from "./Markdown.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

const withStoreAndIntl = (component: ReactElement) => {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });
    return (
        <Provider store={store}>
            <IntlProvider locale="en" messages={messages}>
                {component}
            </IntlProvider>
        </Provider>
    );
};

/**
 * Text shown on the screen, without text given only to screen readers (e.g. a reference chip's type).
 */
function visibleText(element: Element) {
    const clone = element.cloneNode(true) as Element;
    clone.querySelectorAll(".sr-only").forEach((hidden) => hidden.remove());
    return clone.textContent;
}

describe("MarkdownComponent", () => {
    it("renders literal text with reference chips when Markdown is disabled", () => {
        const { container } = render(
            withStoreAndIntl(
                <MarkdownComponent references={[{ id: "revenue_total", type: "metric", title: "Revenue" }]}>
                    {"**bold** :rocket: &amp;\n    > {metric/revenue_total} and {metric/missing}"}
                </MarkdownComponent>,
            ),
        );

        expect(visibleText(container)).toBe("**bold** :rocket: &amp;\n    > Revenue and {metric/missing}");
        expect(container.querySelector("strong, blockquote")).toBeNull();
        expect(container.querySelector(".gd-gen-ai-chat__message__object.metric")).toHaveTextContent(
            "Revenue",
        );
        expect(container.querySelector(".gd-ui-kit-tooltip__anchor")).toHaveTextContent("Revenue");
    });

    it.each([
        "https://example.com/diagnose_stage_rc/diagnose/issuersai/help-center",
        "http://example.com/_training_/**course**?stage=_rc_#help_center",
        "https://example.com/training_(course)?filter[]=stage_rc&next=help_center",
    ])("preserves Markdown characters in a bare external URL: %s", (url) => {
        const { container } = render(
            withStoreAndIntl(<MarkdownComponent allowMarkdown>{`Help Center: ${url}`}</MarkdownComponent>),
        );

        expect(container.textContent).toBe(`Help Center: ${url}`);
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it.each([
        "<https://example.com/diagnose_stage_rc/help-center>",
        "[https://example.com/diagnose_stage_rc/help-center](https://example.com/diagnose_stage_rc/help-center)",
    ])("preserves underscores in an external URL label: %s", (text) => {
        const { container } = render(
            withStoreAndIntl(<MarkdownComponent allowMarkdown>{text}</MarkdownComponent>),
        );

        expect(container.textContent).toBe("https://example.com/diagnose_stage_rc/help-center");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it.each(["https://example.com/help-center", "gooddata://dashboard?ws=workspace_1&id=dashboard_1"])(
        "unescapes Markdown URL labels only once for %s",
        (href) => {
            const url = "http://www.seznam.cz/diagnose_stage_rc/\\_training\\_";
            const { container } = render(
                withStoreAndIntl(
                    <ConfigProvider canManage allowNativeLinks>
                        <MarkdownComponent
                            allowMarkdown
                        >{`[${escapeMarkdown(url)}](${href})`}</MarkdownComponent>
                    </ConfigProvider>,
                ),
            );

            expect(container.textContent).toBe(url);
        },
    );

    it("renders parsed formatting in an external link label without enabling navigation", () => {
        render(
            withStoreAndIntl(
                <MarkdownComponent allowMarkdown>
                    {"[**Help Center** training](https://example.com/diagnose_stage_rc/help-center)"}
                </MarkdownComponent>,
            ),
        );

        expect(screen.getByText("Help Center").tagName.toLowerCase()).toBe("strong");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("does not render a raw HTML anchor as an interactive link", () => {
        const text = '<a href="https://example.com/diagnose_stage_rc/help-center">Help Center</a>';
        const { container } = render(
            withStoreAndIntl(<MarkdownComponent allowMarkdown>{text}</MarkdownComponent>),
        );

        expect(container.textContent).toBe(text);
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("keeps surrounding Markdown formatting without changing the URL", () => {
        const url = "https://example.com/diagnose_stage_rc/help-center";
        const { container } = render(
            withStoreAndIntl(
                <MarkdownComponent
                    allowMarkdown
                >{`**Help Center:** ${url} and _training_`}</MarkdownComponent>,
            ),
        );

        expect(container.textContent).toBe(`Help Center: ${url} and training`);
        expect(screen.getByText("Help Center:").tagName.toLowerCase()).toBe("strong");
        expect(screen.getByText("training").tagName.toLowerCase()).toBe("em");
    });

    it("renders a reference chip for an id with an underscore-word-underscore pattern without CommonMark eating its underscores", () => {
        render(
            withStoreAndIntl(
                <MarkdownComponent
                    allowMarkdown
                    references={[{ id: "spend_amount_-_txn_-_cutcgco", type: "metric", title: "Spend" }]}
                >
                    {"Pick one: {metric/spend_amount_-_txn_-_cutcgco}"}
                </MarkdownComponent>,
            ),
        );

        expect(screen.getByText("Spend")).toBeInTheDocument();
        // Before the fix, CommonMark parsed "_txn_" inside the raw id as emphasis
        // and rendered "txn" as <em>, corrupting the id before the chip logic saw it.
        expect(document.querySelector("em")).toBeNull();
    });

    it("still applies real Markdown emphasis when it is not part of a reference token", () => {
        render(
            withStoreAndIntl(<MarkdownComponent allowMarkdown>{"This is _italic_ text"}</MarkdownComponent>),
        );

        expect(screen.getByText("italic").tagName.toLowerCase()).toBe("em");
    });

    it("renders a MAQL definition as the full MAQL query", () => {
        render(
            withStoreAndIntl(
                <MarkdownComponent
                    allowMarkdown
                    references={[
                        { id: "total_returns", type: "metric", title: "Total Returns" },
                        { id: "total_sales", type: "metric", title: "Total Sales" },
                    ]}
                >
                    {"**Formula:** `SELECT {metric/total_returns} / {metric/total_sales}`"}
                </MarkdownComponent>,
            ),
        );

        expect(visibleText(document.querySelector("code")!)).toBe("SELECT Total Returns / Total Sales");

        const chips = document.querySelectorAll("code .gd-gen-ai-chat__message__object.metric");
        expect(Array.from(chips).map(visibleText)).toEqual(["Total Returns", "Total Sales"]);
    });

    it("renders a document reference as a chip with its title", () => {
        render(
            withStoreAndIntl(
                <MarkdownComponent
                    allowMarkdown
                    references={[{ id: "harvest_brief", type: "document", title: "Harvest Brief" }]}
                >
                    {"See {document/harvest_brief} for details."}
                </MarkdownComponent>,
            ),
        );

        const chip = document.querySelector(".gd-gen-ai-chat__message__object.document");
        expect(chip).toHaveTextContent("Harvest Brief");
        expect(document.body).not.toHaveTextContent("{document/harvest_brief}");
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it.each([
        ["plain text", false, "How many orders have we delivered? {metric/r1}"],
        ["markdown", true, "# Title\n\nI found **10** dashboards, see [it](https://example.com) {metric/r1}"],
    ])("keeps its DOM nodes when re-rendered with new references (%s)", (_, allowMarkdown, text) => {
        const references = () => [{ id: "r1", type: "metric" as const, title: "Spend" }];
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
        });
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    {children}
                </IntlProvider>
            </Provider>
        );
        const { container, rerender } = render(
            <MarkdownComponent allowMarkdown={allowMarkdown} references={references()}>
                {text}
            </MarkdownComponent>,
            { wrapper },
        );
        const nodesBefore = Array.from(container.querySelectorAll("*"));

        // A parent re-render (e.g. a new message or a streaming update) passes a new references array.
        rerender(
            <MarkdownComponent allowMarkdown={allowMarkdown} references={references()}>
                {text}
            </MarkdownComponent>,
        );
        const nodesAfter = Array.from(container.querySelectorAll("*"));

        expect(nodesAfter).toHaveLength(nodesBefore.length);
        nodesAfter.forEach((node, index) => expect(node).toBe(nodesBefore[index]));
    });

    it("renders a reference chip wrapped in a tooltip anchor", () => {
        render(
            withStoreAndIntl(
                <MarkdownComponent allowMarkdown references={[{ id: "r1", type: "metric", title: "Spend" }]}>
                    {"{metric/r1}"}
                </MarkdownComponent>,
            ),
        );

        const trigger = document.querySelector(".gd-ui-kit-tooltip__anchor");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveTextContent("Spend");
    });

    it("announces a focused reference chip with its type, and its description once", async () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
        });
        store.dispatch(
            setCatalogItemsActions([
                {
                    type: "measure",
                    measure: { id: "amount_id", title: "Amount", description: "Total order amount" },
                } as unknown as CatalogItem,
            ]),
        );
        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <ConfigProvider canManage>
                        <MarkdownComponent
                            allowMarkdown
                            references={[{ id: "amount_id", type: "metric", title: "Amount" }]}
                        >
                            {"Total for {metric/amount_id}"}
                        </MarkdownComponent>
                    </ConfigProvider>
                </IntlProvider>
            </Provider>,
        );
        const chip = document.querySelector<HTMLElement>(".gd-gen-ai-chat__message__object")!;

        act(() => chip.focus());

        expect(await screen.findByRole("tooltip")).toHaveTextContent("Total order amount");
        expect(chip).toHaveTextContent("Amount, Metric");
        expect(chip).toHaveAccessibleDescription("Total order amount");
        const descriptionId = chip.getAttribute("aria-describedby")!;
        expect(document.querySelectorAll(`[id="${descriptionId}"]`)).toHaveLength(1);
    });
});
