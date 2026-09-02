// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { createHostNavigationTakeover, inAppPath } from "./hostNavigation.js";

const BASE = "/workspace/ws-1/reports";

describe("inAppPath", () => {
    it("maps the app root and routes under it", () => {
        expect(inAppPath(BASE, BASE)).toBe("/");
        expect(inAppPath(`${BASE}/templates`, BASE)).toBe("/templates");
        expect(inAppPath(`${BASE}/report/r1`, BASE)).toBe("/report/r1");
    });

    it("keeps query and hash", () => {
        expect(inAppPath(`${BASE}/report/r1?mode=export_pdf#top`, BASE)).toBe(
            "/report/r1?mode=export_pdf#top",
        );
        expect(inAppPath(`${BASE}?tab=1`, BASE)).toBe("/?tab=1");
    });

    it("rejects targets outside the app, including path-prefix lookalikes", () => {
        expect(inAppPath("/workspace/ws-1/dashboards", BASE)).toBeUndefined();
        expect(inAppPath(`${BASE}extra`, BASE)).toBeUndefined();
        expect(inAppPath("/workspace/ws-2/reports", BASE)).toBeUndefined();
    });

    it("rejects a target that does not parse as a URL", () => {
        expect(inAppPath("https://%", BASE)).toBeUndefined();
    });

    it("rejects foreign-origin URLs, whatever their pathname", () => {
        expect(inAppPath(`https://other.example${BASE}/templates`, BASE)).toBeUndefined();
        expect(inAppPath(`//other.example${BASE}/templates`, BASE)).toBeUndefined();
    });

    it("accepts an absolute target on the page's own origin", () => {
        vi.stubGlobal("location", { origin: "https://current.example" });
        try {
            expect(inAppPath(`https://current.example${BASE}/templates`, BASE)).toBe("/templates");
            expect(inAppPath(`https://other.example${BASE}/templates`, BASE)).toBeUndefined();
            expect(inAppPath(`${BASE}/templates`, BASE)).toBe("/templates");
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it("rejects dot segments that resolve outside the app, encoded or not", () => {
        expect(inAppPath(`${BASE}/../dashboards`, BASE)).toBeUndefined();
        expect(inAppPath(`${BASE}/%2e%2e/dashboards`, BASE)).toBeUndefined();
        expect(inAppPath(`${BASE}/reports/../../dashboards`, BASE)).toBeUndefined();
    });

    it("keeps dot segments that stay inside the app", () => {
        expect(inAppPath(`${BASE}/templates/../report/r1`, BASE)).toBe("/report/r1");
    });

    it("tolerates a trailing slash on the base path", () => {
        expect(inAppPath(`${BASE}/templates`, `${BASE}/`)).toBe("/templates");
    });
});

describe("createHostNavigationTakeover", () => {
    it("lets the host push first, then renders the in-app target, and reports the takeover", () => {
        const order: string[] = [];
        const navigate = vi.fn(() => {
            order.push("navigate");
        });
        const proceed = vi.fn(() => {
            order.push("proceed");
        });
        const handler = createHostNavigationTakeover(BASE, { current: navigate });

        expect(handler({ url: `${BASE}/templates`, proceed })).toBe(true);
        expect(navigate).toHaveBeenCalledWith("/templates");
        // The host push keeps the host chrome's location state in sync and preserves the source
        // history entry; the app then replaces the pushed entry.
        expect(order).toEqual(["proceed", "navigate"]);
    });

    it("leaves outside targets to the host", () => {
        const navigate = vi.fn();
        const proceed = vi.fn();
        const handler = createHostNavigationTakeover(BASE, { current: navigate });

        expect(handler({ url: "/workspace/ws-1/dashboards", proceed })).toBe(false);
        expect(navigate).not.toHaveBeenCalled();
        expect(proceed).not.toHaveBeenCalled();
    });

    it("leaves everything to the host until the router fills the slot", () => {
        const ref = { current: null };
        const handler = createHostNavigationTakeover(BASE, ref);

        expect(handler({ url: `${BASE}/templates`, proceed: vi.fn() })).toBe(false);
    });
});
