// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownComponent } from "./Markdown.js";

describe("MarkdownComponent", () => {
    it("renders a reference chip for an id with an underscore-word-underscore pattern without CommonMark eating its underscores", () => {
        render(
            <MarkdownComponent
                allowMarkdown
                references={[{ id: "spend_amount_-_txn_-_cutcgco", type: "metric", title: "Spend" }]}
            >
                {"Pick one: {metric/spend_amount_-_txn_-_cutcgco}"}
            </MarkdownComponent>,
        );

        expect(screen.getByText("Spend")).toBeInTheDocument();
        // Before the fix, CommonMark parsed "_txn_" inside the raw id as emphasis
        // and rendered "txn" as <em>, corrupting the id before the chip logic saw it.
        expect(document.querySelector("em")).toBeNull();
    });

    it("still applies real Markdown emphasis when it is not part of a reference token", () => {
        render(<MarkdownComponent allowMarkdown>{"This is _italic_ text"}</MarkdownComponent>);

        expect(screen.getByText("italic").tagName.toLowerCase()).toBe("em");
    });
});
