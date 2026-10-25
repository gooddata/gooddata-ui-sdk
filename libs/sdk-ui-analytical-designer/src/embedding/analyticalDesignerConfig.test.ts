// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { GdcErrorType, type IAdAvailableCommands, type ICommandFailedBody } from "@gooddata/sdk-embedding";
import { type IInsight, type ITheme, idRef, uriRef } from "@gooddata/sdk-model";

import { type IBootstrapData } from "../actions/app_context_actions.js";

import {
    applyConfigToBootstrapData,
    resolveRouteIdentifiers,
    resolveTheme,
    routeTargetKey,
    toEmbeddedCallbacks,
    toRouteConfig,
} from "./analyticalDesignerConfig.js";
import { type IAnalyticalDesignerEvent } from "./analyticalDesignerTypes.js";

const insight = { insight: { identifier: "insight-from-object", uri: "/insights/1" } } as IInsight;

function mockBackend() {
    const getInsight = vi.fn(() => Promise.resolve({ insight: { identifier: "insight-from-uri" } }));
    const getDashboard = vi.fn(() => Promise.resolve({ identifier: "dashboard-from-uri" }));
    const backend = {
        workspace: () => ({
            insights: () => ({ getInsight }),
            dashboards: () => ({ getDashboard }),
        }),
    } as unknown as IAnalyticalBackend;
    return { backend, getInsight, getDashboard };
}

const event = (name: string): IAnalyticalDesignerEvent => ({ product: "analyticalDesigner", name, data: {} });

describe("resolveRouteIdentifiers", () => {
    it("passes identifiers and identifier refs through without a backend request", async () => {
        const { backend, getInsight, getDashboard } = mockBackend();

        const identifiers = await resolveRouteIdentifiers(backend, "ws", idRef("insight-1"), {
            sourceDashboard: "dashboard-1",
            sourceInsight: idRef("source-insight"),
        });

        expect(identifiers).toEqual({
            insightId: "insight-1",
            sourceDashboardId: "dashboard-1",
            sourceInsightId: "source-insight",
        });
        expect(getInsight).not.toHaveBeenCalled();
        expect(getDashboard).not.toHaveBeenCalled();
    });

    it("loads the identifiers of URI refs", async () => {
        const { backend } = mockBackend();

        const identifiers = await resolveRouteIdentifiers(backend, "ws", uriRef("/insights/1"), {
            sourceDashboard: uriRef("/dashboards/1"),
        });

        expect(identifiers.insightId).toBe("insight-from-uri");
        expect(identifiers.sourceDashboardId).toBe("dashboard-from-uri");
    });

    it("reads the identifier of an insight object", async () => {
        const { backend } = mockBackend();

        const identifiers = await resolveRouteIdentifiers(backend, "ws", insight, {});

        expect(identifiers.insightId).toBe("insight-from-object");
    });

    it("keeps an empty source dashboard, which marks the edit-from-dashboard flow", async () => {
        const { backend } = mockBackend();

        const identifiers = await resolveRouteIdentifiers(backend, "ws", undefined, { sourceDashboard: "" });

        expect(identifiers).toEqual({
            insightId: undefined,
            sourceDashboardId: "",
            sourceInsightId: undefined,
        });
    });
});

describe("routeTargetKey", () => {
    it("gives an identifier, its ref and the insight object distinct stable keys", () => {
        expect(routeTargetKey(undefined)).toBe("");
        expect(routeTargetKey("a")).toBe(routeTargetKey("a"));
        expect(routeTargetKey(insight)).toBe("id:insight-from-object");
        expect(routeTargetKey(uriRef("/insights/1"))).not.toBe(routeTargetKey("/insights/1"));
    });
});

describe("toRouteConfig", () => {
    it("maps the config onto the embedded route", () => {
        expect(
            toRouteConfig(
                { insightId: "insight-1", sourceDashboardId: "", sourceInsightId: undefined },
                {
                    hiddenActions: ["save"],
                    displayedActions: ["cancel"],
                    allowDashboardLinks: true,
                    isEmbedded: true,
                    separators: { thousand: " ", decimal: "," },
                    asOfDate: "2026-01-01",
                    includeObjectsWithTags: ["a"],
                    excludeObjectsWithTags: ["b"],
                },
            ),
        ).toEqual({
            insightId: "insight-1",
            sourceDashboardId: "",
            sourceInsightId: undefined,
            hideActions: ["save"],
            displayActions: ["cancel"],
            allowDashboardLinks: true,
            isEmbeddedFromKD: true,
            thousandSeparator: " ",
            decimalSeparator: ",",
            asOfDate: "2026-01-01",
            includeObjectsWithTags: ["a"],
            excludeObjectsWithTags: ["b"],
        });
    });
});

describe("resolveTheme", () => {
    const loaded: ITheme = { palette: { primary: { base: "#000000" } } };
    const own: ITheme = { palette: { primary: { base: "#ffffff" } } };

    it("prefers the theme of the props to the loaded one", () => {
        expect(resolveTheme({ theme: own }, loaded)).toBe(own);
        expect(resolveTheme({}, loaded)).toBe(loaded);
    });

    it("applies the modifier", () => {
        const modified: ITheme = { palette: { primary: { base: "#ff0000" } } };

        expect(resolveTheme({ themeModifier: () => modified }, loaded)).toBe(modified);
    });

    it("returns an empty theme when theme loading is disabled", () => {
        expect(resolveTheme({ disableThemeLoading: true }, undefined)).toEqual({});
    });
});

describe("applyConfigToBootstrapData", () => {
    const data = {
        mapboxToken: "loaded-mapbox",
        user: { formatLocale: "en-US", separators: { thousand: ",", decimal: "." } },
        uiSettings: { logoUrl: "/loaded.svg", isBranded: false, organizationName: "Acme" },
        tiger: { isOrganizationAdmin: false, organizationEntitlements: [] },
    } as unknown as IBootstrapData;

    it("keeps the loaded values the config does not provide", () => {
        const result = applyConfigToBootstrapData(data, {}, undefined);

        expect(result.mapboxToken).toBe("loaded-mapbox");
        expect(result.user.formatLocale).toBe("en-US");
        expect(result.uiSettings).toEqual(data.uiSettings);
    });

    it("applies the values the config provides", () => {
        const theme: ITheme = { palette: { primary: { base: "#123456" } } };
        const result = applyConfigToBootstrapData(
            data,
            {
                mapboxToken: "own-mapbox",
                agGridToken: "own-ag-grid",
                formatLocale: "cs-CZ",
                whiteLabeling: { logoUrl: "/own.svg", isBranded: true },
                organization: { isAdmin: true, expiredDate: "2026-12-31" },
            },
            theme,
        );

        expect(result.mapboxToken).toBe("own-mapbox");
        expect(result.agGridToken).toBe("own-ag-grid");
        expect(result.user.formatLocale).toBe("cs-CZ");
        expect(result.uiSettings.logoUrl).toBe("/own.svg");
        expect(result.uiSettings.isBranded).toBe(true);
        expect(result.tiger).toMatchObject({
            isOrganizationAdmin: true,
            organizationExpiredDate: "2026-12-31",
        });
        expect(result.theme).toBe(theme);
    });
});

describe("toEmbeddedCallbacks", () => {
    it("calls onMetricsChanged for the metricsChanged event", () => {
        const onMetricsChanged = vi.fn();
        const onEvent = vi.fn();

        toEmbeddedCallbacks({ onMetricsChanged, onEvent }).onEvent?.(event("metricsChanged"));

        expect(onEvent).toHaveBeenCalledOnce();
        expect(onMetricsChanged).toHaveBeenCalledOnce();
    });

    it("calls only the event handlers that accept the event", () => {
        const accepted = vi.fn();
        const rejected = vi.fn();

        toEmbeddedCallbacks({
            eventHandlers: [
                { eval: (e) => e.name === "insightSaved", handler: accepted },
                { eval: () => false, handler: rejected },
            ],
        }).onEvent?.(event("insightSaved"));

        expect(accepted).toHaveBeenCalledOnce();
        expect(rejected).not.toHaveBeenCalled();
    });

    it("maps the command failures onto onCommandFailed", () => {
        const onCommandFailed = vi.fn();
        const failure: ICommandFailedBody = {
            errorCode: GdcErrorType.InvalidCommand,
            errorMessage: "failed",
        };

        toEmbeddedCallbacks({ onCommandFailed }).onAppCommandFailed?.(failure, "context-1");

        expect(onCommandFailed).toHaveBeenCalledWith(failure, "context-1");
    });

    it("passes the command context to the callbacks of the command results", () => {
        const onSetFilterContextFinished = vi.fn();
        const data: IAdAvailableCommands = { availableCommands: [] };

        toEmbeddedCallbacks({ onSetFilterContextFinished }).onSetFilterContextFinished?.(data, "context-1");

        expect(onSetFilterContextFinished).toHaveBeenCalledWith(data, "context-1");
    });
});
