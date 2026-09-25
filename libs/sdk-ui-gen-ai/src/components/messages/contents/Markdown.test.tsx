// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { chatWindowSliceName, chatWindowSliceReducer } from "../../../store/chatWindow/chatWindowSlice.js";

import { MarkdownComponent } from "./Markdown.js";

const withStoreAndIntl = (component: ReactElement) => {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
        },
    });
    return (
        <Provider store={store}>
            <IntlProvider locale="en">{component}</IntlProvider>
        </Provider>
    );
};

describe("MarkdownComponent", () => {
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

    it("renders a MAQL definition as the full MAQL query, each reference titled as in the metric editor", () => {
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

        expect(document.querySelector("code")).toHaveTextContent(
            "SELECT Total Returns {metric/total_returns} / Total Sales {metric/total_sales}",
        );

        const chips = document.querySelectorAll("code .gd-gen-ai-chat__message__object.metric");
        expect([...chips].map((chip) => chip.textContent)).toEqual(["Total Returns", "Total Sales"]);
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
});
