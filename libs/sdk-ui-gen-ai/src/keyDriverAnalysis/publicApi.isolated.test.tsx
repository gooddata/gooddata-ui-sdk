// (C) 2026 GoodData Corporation

import { type ReactNode, useRef } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterAll, describe, expect, it, vi } from "vitest";

import { insightSetFilters, newPositiveAttributeFilter } from "@gooddata/sdk-model";
import { type IDrillEvent } from "@gooddata/sdk-ui";
import { DRILL_MENU_EXPANDED_CHANGE_EVENT, DRILL_MENU_HOST_ATTRIBUTE } from "@gooddata/sdk-ui-charts";
import { type IKdaDefinition } from "@gooddata/sdk-ui-dashboard";
import type * as DashboardInternal from "@gooddata/sdk-ui-dashboard/internal";
import { InsightRenderer } from "@gooddata/sdk-ui-ext";
import type * as SdkUiExt from "@gooddata/sdk-ui-ext";

import {
    GenAiKeyDriverAnalysis,
    GenAiStore,
    type IUseDrillKeyDriverAnalysisOptions,
    useDrillKeyDriverAnalysis,
} from "../index.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceReducer } from "../store/messages/messagesSlice.js";
import { returnFocusToKdaTrigger } from "../utils/kdaReturnFocus.js";

import { createKdaDefinitionFromDrill, getKdaDrillCombinations } from "./drilling.js";
import { createDrillEvent, insight } from "./drilling.test.fixtures.js";
import { useOpenKeyDriverAnalysis } from "./useOpenKeyDriverAnalysis.js";

// Keep the real public API and store orchestration; replace only the backend-driven UI boundaries.
afterAll(() => vi.resetModules());
vi.mock("@gooddata/sdk-ui-dashboard/internal", async (importOriginal) => ({
    ...(await importOriginal<typeof DashboardInternal>()),
    IntlWrapper: ({ children }: { children: ReactNode }) => children,
    KdaStoreProvider: ({ children }: { children: ReactNode }) => children,
    KdaDialogController: ({
        requestedDefinition,
        onRequestedDefinitionChange,
        onClose,
    }: {
        requestedDefinition: IKdaDefinition;
        onRequestedDefinitionChange: (definition?: IKdaDefinition) => void;
        onClose: () => void;
    }) => (
        <div role="dialog" aria-label="Key Driver Analysis">
            <output>{requestedDefinition.range.map((point) => point.date).join(" / ")}</output>
            <button
                onClick={() => {
                    onRequestedDefinitionChange(undefined);
                    onClose();
                }}
            >
                Close analysis
            </button>
        </div>
    ),
}));

vi.mock("@gooddata/sdk-ui-ext", async (importOriginal) => ({
    ...(await importOriginal<typeof SdkUiExt>()),
    InsightRenderer: ({ onDrill }: { onDrill: (event: IDrillEvent) => void }) => (
        <button onClick={() => onDrill(createDrillEvent())}>Chart point</button>
    ),
}));

function makeStore() {
    return configureStore({
        reducer: { chatWindow: chatWindowSliceReducer, messages: messagesSliceReducer },
    });
}

function CustomChart({
    event,
    ...options
}: Partial<Omit<IUseDrillKeyDriverAnalysisOptions, "anchorRef">> & { event?: IDrillEvent } = {}) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const chartInsight = options.insight ?? insight;
    const { drillableItems, onDrill, drillMenu } = useDrillKeyDriverAnalysis({
        ...options,
        insight: chartInsight,
        anchorRef,
    });

    return (
        <div ref={anchorRef}>
            <InsightRenderer
                insight={chartInsight}
                locale="en-US"
                settings={undefined}
                colorPalette={undefined}
                drillableItems={drillableItems}
                onDrill={(drillEvent) => onDrill(event ?? drillEvent)}
            />
            {drillMenu}
        </div>
    );
}

describe("public Key Driver Analysis API", () => {
    it("opens the selected comparison under GenAiStore and restores focus on close", async () => {
        const store = makeStore();
        // GenAiStore resolves the provided store asynchronously. Rendering inside an async act lets that
        // update and the chart's mount effects settle before the click, so a late mount effect cannot
        // clear the drill selection the click makes.
        await act(async () => {
            render(
                <GenAiStore providedStore={Promise.resolve(store)}>
                    <CustomChart />
                    <GenAiKeyDriverAnalysis />
                </GenAiStore>,
            );
        });
        const point = await screen.findByRole("button", { name: "Chart point" });
        point.focus();
        fireEvent.click(point);

        const comparisons = await screen.findAllByRole("menuitem");
        expect(comparisons).toHaveLength(2);
        const menu = screen.getByRole("menu");
        fireEvent.keyDown(menu, { code: "ArrowDown" });
        fireEvent.keyDown(menu, { code: "Enter" });

        expect(await screen.findByRole("dialog", { name: "Key Driver Analysis" })).toHaveTextContent(
            "2024-01-01 / 2025-01-01",
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        const close = screen.getByRole("button", { name: "Close analysis" });
        close.focus();
        // happy-dom does not track input modality; emulate the browser's keyboard-focus indicator.
        const querySelector = document.querySelector.bind(document);
        vi.spyOn(document, "querySelector").mockImplementation((selector) =>
            selector === ":focus-visible" ? close : querySelector(selector),
        );
        fireEvent.click(close);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(point).toHaveFocus();
        expect(store.getState().chatWindow.keyDriverAnalysis).toBeUndefined();
    });

    it("keeps chart props stable across renders without changing the context", () => {
        const store = makeStore();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );
        const anchorRef = { current: null };
        const { result, rerender } = renderHook(() => useDrillKeyDriverAnalysis({ insight, anchorRef }), {
            wrapper,
        });
        const initial = result.current;
        rerender();
        expect(result.current.onDrill).toBe(initial.onDrill);
        expect(result.current.drillableItems).toBe(initial.drillableItems);
        expect(result.current.drillMenu).toBeNull();
    });

    it.each([false, true])(
        "keeps the comparison menu open when equivalent filters are recreated on every render (with filter: %s)",
        (withFilter) => {
            const store = makeStore();
            const wrapper = ({ children }: { children: ReactNode }) => (
                <Provider store={store}>{children}</Provider>
            );
            const anchorRef = { current: null };
            const { result, rerender } = renderHook(
                ({ filterValue }) =>
                    useDrillKeyDriverAnalysis({
                        insight,
                        anchorRef,
                        filters: filterValue
                            ? [newPositiveAttributeFilter("product", { uris: [filterValue] })]
                            : [],
                    }),
                { wrapper, initialProps: { filterValue: withFilter ? "/A" : undefined } },
            );

            act(() => result.current.onDrill(createDrillEvent()));
            expect(result.current.drillMenu).not.toBeNull();
            rerender({ filterValue: withFilter ? "/A" : undefined });
            expect(result.current.drillMenu).not.toBeNull();
            rerender({ filterValue: "/B" });
            expect(result.current.drillMenu).toBeNull();
        },
    );

    it.each([false, true])(
        "does not offer disabled drilling (per-measure control: %s)",
        (disabledMeasure) => {
            const store = makeStore();
            const chartInsight = disabledMeasure
                ? {
                      insight: {
                          ...insight.insight,
                          properties: { controls: { disableKeyDriveAnalysisOn: { revenue: true } } },
                      },
                  }
                : insight;
            const wrapper = ({ children }: { children: ReactNode }) => (
                <Provider store={store}>{children}</Provider>
            );
            const { result } = renderHook(
                () =>
                    useDrillKeyDriverAnalysis({
                        insight: chartInsight,
                        anchorRef: { current: null },
                        enabled: disabledMeasure,
                    }),
                { wrapper },
            );

            expect(result.current.drillableItems).toEqual([]);
            act(() => result.current.onDrill(createDrillEvent()));
            expect(result.current.drillMenu).toBeNull();
            expect(store.getState().chatWindow.keyDriverAnalysis).toBeUndefined();
        },
    );

    it("ignores unsupported drills and only enables seconds when requested", () => {
        const store = makeStore();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );
        const anchorRef = { current: null };
        const { result, rerender } = renderHook(
            ({ enableSecondGranularities }) =>
                useDrillKeyDriverAnalysis({
                    insight,
                    anchorRef,
                    enableSecondGranularities,
                }),
            { wrapper, initialProps: { enableSecondGranularities: false } },
        );

        act(() => result.current.onDrill(createDrillEvent(1, "DAY_OF_WEEK")));
        expect(result.current.drillMenu).toBeNull();
        act(() => result.current.onDrill(createDrillEvent(1, "SECOND")));
        expect(result.current.drillMenu).toBeNull();
        rerender({ enableSecondGranularities: true });
        act(() => result.current.onDrill(createDrillEvent(1, "SECOND")));
        expect(result.current.drillMenu).not.toBeNull();
    });

    it("still offers a menu for a single comparison instead of opening analysis automatically", async () => {
        const store = makeStore();
        render(
            <Provider store={store}>
                <CustomChart event={createDrillEvent(0)} />
            </Provider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        expect(await screen.findAllByRole("menuitem")).toHaveLength(1);
        expect(store.getState().chatWindow.keyDriverAnalysis).toBeUndefined();
    });

    it("dismisses with Escape, reports expanded state, and restores original focus", async () => {
        const store = makeStore();
        const event = createDrillEvent();
        render(
            <Provider store={store}>
                <CustomChart event={event} />
            </Provider>,
        );
        const point = screen.getByRole("button", { name: "Chart point" });
        event.target = point;
        const expandedChange = vi.fn();
        point.addEventListener(DRILL_MENU_EXPANDED_CHANGE_EVENT, expandedChange);
        expect(point.parentElement).toHaveAttribute(DRILL_MENU_HOST_ATTRIBUTE, "true");
        point.focus();
        fireEvent.click(point);
        const menu = await screen.findByRole("menu");
        menu.focus();
        expect(expandedChange.mock.calls[0][0].detail.expanded).toBe(true);
        fireEvent.keyDown(menu, { key: "Escape", code: "Escape" });

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(expandedChange.mock.calls[1][0].detail.expanded).toBe(false);
        await waitFor(() => expect(point).toHaveFocus());
        expect(store.getState().chatWindow.keyDriverAnalysis).toBeUndefined();
    });

    it("closes on an outside click without taking focus away from the clicked control", async () => {
        const store = makeStore();
        render(
            <Provider store={store}>
                <CustomChart />
                <button>Outside</button>
            </Provider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        expect(await screen.findByRole("menu")).toBeInTheDocument();
        const outside = screen.getByRole("button", { name: "Outside" });
        fireEvent.mouseDown(outside);
        outside.focus();
        fireEvent.click(outside);
        await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
        expect(outside).toHaveFocus();
    });

    it("closes when disabled and does not reopen a stale menu when re-enabled", async () => {
        const store = makeStore();
        const { rerender } = render(
            <Provider store={store}>
                <CustomChart />
            </Provider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        expect(await screen.findByRole("menu")).toBeInTheDocument();
        rerender(
            <Provider store={store}>
                <CustomChart enabled={false} />
            </Provider>,
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        rerender(
            <Provider store={store}>
                <CustomChart />
            </Provider>,
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes when the chart's insight or effective filters change", async () => {
        const store = makeStore();
        const { rerender } = render(
            <Provider store={store}>
                <CustomChart />
            </Provider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        expect(await screen.findByRole("menu")).toBeInTheDocument();
        const filters = [newPositiveAttributeFilter("product", { uris: ["/A"] })];
        rerender(
            <Provider store={store}>
                <CustomChart filters={filters} />
            </Provider>,
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        expect(await screen.findByRole("menu")).toBeInTheDocument();
        rerender(
            <Provider store={store}>
                <CustomChart insight={{ insight: { ...insight.insight } }} filters={filters} />
            </Provider>,
        );
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it.each([false, true])(
        "uses effective filters and the requested locale (explicit filters: %s)",
        async (explicitFilters) => {
            const store = makeStore();
            const filters = [newPositiveAttributeFilter("product", { uris: ["/A"] })];
            render(
                <Provider store={store}>
                    <CustomChart
                        insight={explicitFilters ? insight : insightSetFilters(insight, filters)}
                        filters={explicitFilters ? filters : undefined}
                        locale="de-DE"
                    />
                </Provider>,
            );
            fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
            fireEvent.click((await screen.findAllByRole("menuitem"))[0]);

            const definition = store.getState().chatWindow.keyDriverAnalysis;
            expect(definition?.filters).toMatchObject([
                { attributeFilter: { attributeElements: { uris: ["/A"] } } },
            ]);
            expect(definition?.range[0].format?.locale).toBe("de-DE");
        },
    );

    it("does not dispatch an invalid definition when normalized dates are missing", async () => {
        const store = makeStore();
        const event = createDrillEvent();
        for (const dimension of event.dataView.headerItems) {
            for (const headers of dimension) {
                for (const header of headers) {
                    if ("attributeHeaderItem" in header) {
                        header.attributeHeaderItem.normalizedValue = undefined;
                    }
                }
            }
        }
        render(
            <Provider store={store}>
                <CustomChart event={event} />
            </Provider>,
        );
        fireEvent.click(screen.getByRole("button", { name: "Chart point" }));
        fireEvent.click((await screen.findAllByRole("menuitem"))[0]);
        expect(store.getState().chatWindow.keyDriverAnalysis).toBeUndefined();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("keeps the opener stable across renders and restores the active trigger by default", () => {
        const store = makeStore();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );
        const { result, rerender } = renderHook(() => useOpenKeyDriverAnalysis(), { wrapper });
        const callback = result.current;
        rerender();
        expect(result.current).toBe(callback);

        render(<button>Trigger</button>);
        const trigger = screen.getByRole("button", { name: "Trigger" });
        trigger.focus();
        const event = createDrillEvent();
        const definition = createKdaDefinitionFromDrill({
            catalogItems: [],
            locale: "en-US",
            comparison: getKdaDrillCombinations(event)[0],
            event,
        })!;
        act(() => callback(definition));
        expect(store.getState().chatWindow.keyDriverAnalysis).toEqual(definition);
        const querySelector = document.querySelector.bind(document);
        vi.spyOn(document, "querySelector").mockImplementation((selector) =>
            selector === ":focus-visible" ? trigger : querySelector(selector),
        );
        const focus = vi.spyOn(trigger, "focus");
        returnFocusToKdaTrigger();
        expect(focus).toHaveBeenCalledOnce();
    });

    it("restores a chart data point using the original drill coordinates", () => {
        const store = makeStore();
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );
        const { result } = renderHook(() => useOpenKeyDriverAnalysis(), { wrapper });
        const event = createDrillEvent();
        Object.assign(event.drillContext, { chartId: "chart-1", seriesIndex: 2, pointIndex: 3 });
        const definition = createKdaDefinitionFromDrill({
            catalogItems: [],
            locale: "en-US",
            comparison: getKdaDrillCombinations(event)[0],
            event,
        })!;
        act(() => result.current(definition, { drillEvent: event }));

        vi.spyOn(document, "querySelector").mockReturnValue(document.body);
        const dispatchEvent = vi.spyOn(window, "dispatchEvent");
        returnFocusToKdaTrigger();
        expect(dispatchEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "gd:chart:focusDatapoint",
                detail: { type: "chart", chartId: "chart-1", seriesIndex: 2, pointIndex: 3 },
            }),
        );
    });
});
