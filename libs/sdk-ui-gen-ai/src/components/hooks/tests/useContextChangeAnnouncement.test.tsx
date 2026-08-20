// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { en_US } from "../../../localization/bundles/en-US.localization-bundle.js";
import { type IGenAIContextObject } from "../../../types.js";
import { useContextChangeAnnouncement } from "../useContextChangeAnnouncement.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

function reference(id: string, title: string): IGenAIContextObject {
    return {
        id,
        ref: { identifier: id, type: "insight" },
        title,
        nesting: 1,
        type: "widget",
        where: "referencedObjects",
    };
}

const dashboard = reference("dashboard-1", "Revenue Dashboard");
const chart = reference("insight-1", "Sales Chart");
const otherDashboard = reference("dashboard-2", "Sales Dashboard");

function renderAnnouncement(initial: IGenAIContextObject[]) {
    return renderHook(
        ({ references }: { references: IGenAIContextObject[] }) => useContextChangeAnnouncement(references),
        {
            initialProps: { references: initial },
            wrapper: ({ children }: { children: ReactNode }) => (
                <IntlProvider locale="en" messages={messages}>
                    {children}
                </IntlProvider>
            ),
        },
    );
}

describe("useContextChangeAnnouncement", () => {
    it("says nothing about the context the chat opened with", () => {
        const { result } = renderAnnouncement([dashboard, chart]);

        expect(result.current).toBe("");
    });

    it("announces added references", async () => {
        const { result, rerender } = renderAnnouncement([dashboard]);

        rerender({ references: [dashboard, chart] });

        await waitFor(() => expect(result.current).toBe("Sales Chart added to the assistant context."));
    });

    it("announces removed references", async () => {
        const { result, rerender } = renderAnnouncement([dashboard, chart]);

        rerender({ references: [dashboard] });

        await waitFor(() => expect(result.current).toBe("Sales Chart removed from the assistant context."));
    });

    it("announces the empty context once the last reference goes", async () => {
        const { result, rerender } = renderAnnouncement([dashboard]);

        rerender({ references: [] });

        await waitFor(() => expect(result.current).toBe("The assistant context is now empty."));
    });

    it("announces a switch when references are replaced at once, e.g. on dashboard navigation", async () => {
        const { result, rerender } = renderAnnouncement([dashboard, chart]);

        rerender({ references: [otherDashboard] });

        await waitFor(() => expect(result.current).toBe("Assistant context switched to Sales Dashboard."));
    });
});
