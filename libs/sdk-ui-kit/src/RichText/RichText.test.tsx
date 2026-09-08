// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type IRichTextProps, RichText } from "./RichText.js";

// The reference-evaluating hook reaches for a strict backend whether or not references are on.
const renderRichText = (props: IRichTextProps) =>
    render(
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <RichText {...props} />
            </WorkspaceProvider>
        </BackendProvider>,
    );

describe("RichText", () => {
    it("recognises the whole of markdown by default", async () => {
        renderRichText({ value: "# Heading" });

        expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Heading");
    });

    it("narrowed to emphasis, leaves a heading as the characters that were typed", async () => {
        const { container } = renderRichText({ value: "# Heading", allowedMarkdown: ["emphasis"] });

        expect(await screen.findByText("# Heading")).toBeInTheDocument();
        expect(container.querySelector("h1")).toBeNull();
    });

    it("recognises the features it is given and no others", async () => {
        const { container } = renderRichText({
            value: "# Heading with **bold**",
            allowedMarkdown: ["headings"],
        });

        expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Heading with **bold**");
        expect(container.querySelector("strong")).toBeNull();
    });

    it("narrowed to no features at all, renders the whole value as text", async () => {
        const { container } = renderRichText({ value: "# Heading", allowedMarkdown: [] });

        expect(await screen.findByText("# Heading")).toBeInTheDocument();
        expect(container.querySelector("h1")).toBeNull();
    });

    // Asked for with the feature ON, so the tag really is parsed as html and it is the missing
    // rehype-raw that keeps it inert. With the feature off it never reaches that question.
    it("renders a recognised html tag as text, having no rehype-raw", async () => {
        const { container } = renderRichText({
            value: "<b>bold</b> and <script>alert(1)</script>",
            allowedMarkdown: ["html"],
        });

        expect(await screen.findByText(/<b>bold<\/b>/)).toBeInTheDocument();
        expect(container.querySelector("b, script")).toBeNull();
    });

    // The whole of what the feature changes: html it recognises is a block of its own, html it does
    // not is paragraph text. Neither renders as markup.
    it("wraps unrecognised html in a paragraph and recognised html in nothing", async () => {
        const withoutHtml = renderRichText({ value: "<div>block</div>", allowedMarkdown: [] });
        expect(await screen.findByText("<div>block</div>")).toBeInTheDocument();
        expect(withoutHtml.container.querySelector("p")).not.toBeNull();
        withoutHtml.unmount();

        const withHtml = renderRichText({ value: "<div>block</div>", allowedMarkdown: ["html"] });
        expect(await screen.findByText("<div>block</div>")).toBeInTheDocument();
        expect(withHtml.container.querySelector("p")).toBeNull();
    });
});
