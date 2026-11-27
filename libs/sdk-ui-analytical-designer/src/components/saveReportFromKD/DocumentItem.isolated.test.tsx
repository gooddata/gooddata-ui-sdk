// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, describe, expect, it, vi } from "vitest";

import { isAllowedDashboardLinks } from "../../selectors/route_selector.js";
import { documentUriFactorySelector } from "../../selectors/uri_selector.js";
import { type IInsightUsageInDocumentItem } from "../../store/insight_usage/insight_usage_state.js";

import { DocumentItem } from "./DocumentItem.js";

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

afterAll(() => {
    // Drop DocumentItem from the shared (isolate:false) module registry so sibling files do not
    // reuse the copy bound to the mocked useSelector.
    vi.resetModules();
});

describe("DocumentItem", () => {
    function renderItem(item: IInsightUsageInDocumentItem, isLinkAllowed = true) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            switch (selector) {
                case isAllowedDashboardLinks:
                    return isLinkAllowed;
                case documentUriFactorySelector:
                    return documentUriFactorySelector.resultFunc("ws");
                default:
                    return undefined;
            }
        });
        return render(<DocumentItem item={item} />);
    }

    it("links a document", () => {
        const { container } = renderItem({
            id: "doc1",
            title: "Board pack",
            type: "document",
        });

        expect(container.querySelector("a")?.getAttribute("href")).toBe(
            "/workspace/ws/reports/document/doc1",
        );
    });

    it("does not link a document when links are not allowed", () => {
        const { container } = renderItem({ id: "doc1", title: "Board pack", type: "document" }, false);

        expect(container.querySelector("a")).toBeNull();
    });

    it.each(["documentTemplate", "pageTemplate"] as const)("names a %s without linking it", (type) => {
        const { container } = renderItem({
            id: "monthly",
            title: "Monthly review",
            type,
        });

        expect(container.textContent).toBe("Monthly review");
        expect(container.querySelector("a")).toBeNull();
    });
});
