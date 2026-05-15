// (C) 2022-2026 GoodData Corporation

// @vitest-environment happy-dom

import { createElement, useEffect } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

const renderSpy = vi.fn();
let autoCompleteOnMount = false;

function MockInsightView(props: Record<string, unknown>) {
    const onLoadingChanged = props["onLoadingChanged"] as
        | ((state: { isLoading: boolean }) => void)
        | undefined;

    useEffect(() => {
        if (autoCompleteOnMount) {
            onLoadingChanged?.({ isLoading: false });
        }
    }, [onLoadingChanged]);

    return createElement("div");
}

vi.mock("@gooddata/sdk-ui-ext", () => ({
    InsightView: (props: Record<string, unknown>) => {
        renderSpy(props);
        return createElement(MockInsightView, props);
    },
}));

const flushMicrotasks = async (count = 4) => {
    for (let i = 0; i < count; i += 1) {
        await Promise.resolve();
    }

    await new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
};

describe("Insight", () => {
    beforeEach(() => {
        vi.resetModules();
        renderSpy.mockClear();
        autoCompleteOnMount = false;
        document.body.innerHTML = "";
    });

    it("registers gd-insight as the legacy runtime and gd-insight-embed as the strict runtime", async () => {
        const { Insight } = await import("../visualizations/Insight.js");
        const { InsightEmbed } = await import("../visualizations/InsightEmbed.js");

        await import("../index.js");

        expect(customElements.get("gd-insight")).toBe(Insight);
        expect(customElements.get("gd-insight-embed")).toBe(InsightEmbed);
    });

    it("renders legacy gd-insight directly instead of wrapping gd-insight-embed", async () => {
        const { setContext } = await import("../context.js");
        const { Insight: InsightElement } = await import("../visualizations/Insight.js");

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const tagName = "test-legacy-gd-insight-direct";
        customElements.define(tagName, InsightElement);

        const element = document.createElement(tagName) as HTMLElement;
        element.setAttribute("insight", "first-insight");

        document.body.append(element);
        await flushMicrotasks();

        expect(element.querySelector("gd-insight-embed")).toBeNull();
        expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
            insight: "first-insight",
        });

        element.setAttribute("insight", "second-insight");
        await flushMicrotasks();

        expect(element.querySelector("gd-insight-embed")).toBeNull();
        expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
            insight: "second-insight",
        });
    });

    it("should prefer property snapshots over bootstrap attributes", async () => {
        const { setContext } = await import("../context.js");
        const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

        const defaultBackend = dummyBackend();
        const propertyBackend = dummyBackend();

        setContext({ backend: defaultBackend, workspaceId: "default-workspace" });

        const tagName = "test-gd-insight-props";
        customElements.define(tagName, InsightElement);

        const element = document.createElement(tagName) as HTMLElement & {
            context?: unknown;
            config?: unknown;
            insight?: string;
            filters?: unknown[];
            title?: unknown;
        };

        element.setAttribute("insight", "attribute-insight");
        element.setAttribute("title", "");
        element.setAttribute("filters", JSON.stringify([{ attributeFilter: "attribute" }]));

        document.body.append(element);
        element.context = { backend: propertyBackend, workspaceId: "property-workspace" };
        element.config = { separators: { thousand: "," } };
        element.insight = "property-insight";
        element.filters = [{ filter: "property" }];
        element.title = "Property Title";
        await flushMicrotasks();

        expect(renderSpy.mock.lastCall?.[0]).toMatchObject({
            backend: propertyBackend,
            workspace: "property-workspace",
            insight: "property-insight",
            filters: [{ filter: "property" }],
            showTitle: "Property Title",
            config: { separators: { thousand: "," } },
        });
    });

    it("should resolve refresh after the insight finishes loading", async () => {
        const { setContext } = await import("../context.js");
        const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const tagName = "test-gd-insight-refresh";
        customElements.define(tagName, InsightElement);

        const element = document.createElement(tagName) as HTMLElement & {
            insight?: string;
            refresh: () => Promise<void>;
        };
        element.insight = "insight-id";

        document.body.append(element);
        await flushMicrotasks();

        const refreshPromise = element.refresh();
        await flushMicrotasks(1);

        const latestProps = renderSpy.mock.lastCall?.[0] as {
            onLoadingChanged: (state: { isLoading: boolean }) => void;
        };

        latestProps.onLoadingChanged({ isLoading: false });

        await expect(refreshPromise).resolves.toBeUndefined();
    });

    it("should remount the insight view when refresh is requested", async () => {
        const { setContext } = await import("../context.js");
        const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });
        autoCompleteOnMount = true;

        const tagName = "test-gd-insight-refresh-remount";
        customElements.define(tagName, InsightElement);

        const element = document.createElement(tagName) as HTMLElement & {
            insight?: string;
            refresh: () => Promise<void>;
        };
        element.insight = "insight-id";

        document.body.append(element);
        await flushMicrotasks();

        const initialRenderCount = renderSpy.mock.calls.length;
        const refreshPromise = element.refresh();
        await flushMicrotasks();

        await expect(refreshPromise).resolves.toBeUndefined();
        expect(renderSpy.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });

    it("should emit gd-error and reject refresh when the insight reports an error", async () => {
        const { setContext } = await import("../context.js");
        const { InsightEmbed: InsightElement } = await import("../visualizations/InsightEmbed.js");

        setContext({ backend: dummyBackend(), workspaceId: "workspace" });

        const tagName = "test-gd-insight-error";
        customElements.define(tagName, InsightElement);

        const element = document.createElement(tagName) as HTMLElement & {
            insight?: string;
            refresh: () => Promise<void>;
        };
        element.insight = "insight-id";

        const gdErrors: Array<{ phase: string; message: string }> = [];
        const legacyErrors: Array<{ message: string }> = [];
        element.addEventListener("gd-error", (event) => {
            gdErrors.push((event as CustomEvent<{ phase: string; message: string }>).detail);
        });
        element.addEventListener("error", (event) => {
            legacyErrors.push((event as unknown as CustomEvent<{ message: string }>).detail);
        });

        document.body.append(element);
        await flushMicrotasks();

        const refreshPromise = element.refresh();
        await flushMicrotasks(1);

        const latestProps = renderSpy.mock.lastCall?.[0] as {
            onError: (error: Error) => void;
        };
        const error = new Error("Insight failed");

        latestProps.onError(error);

        await expect(refreshPromise).rejects.toThrow("Insight failed");
        expect(legacyErrors.at(-1)).toMatchObject({ message: "Insight failed" });
        expect(gdErrors.at(-1)).toMatchObject({
            phase: "update",
            message: "Insight failed",
        });
    });
});
