// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { invariant } from "ts-invariant";

import { type IFilter, type IInsight, type ObjRef, idRef } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    type IDrillEvent,
    type IExportFunction,
    type ILoadingState,
    resolveLocale,
} from "@gooddata/sdk-ui";
import type { InsightView } from "@gooddata/sdk-ui-ext";

import {
    CustomElementAdapter,
    EVENT_HANDLER,
    GET_COMPONENT,
    LOAD_COMPONENT,
} from "../common/CustomElementAdapter.js";
import { stringToFilters } from "../common/typeGuards/stringToFilters.js";
import { type CustomElementContext } from "../context.js";

type IInsightView = typeof InsightView;
type InsightTitle = ComponentProps<IInsightView>["showTitle"];

function parseFilters(stringifiedFilters: string | null | undefined) {
    if (!stringifiedFilters) {
        return undefined;
    }
    try {
        return stringToFilters(stringifiedFilters);
    } catch (e) {
        console.error("Invalid filters not used in <gd-insight> component", e, stringifiedFilters);
        return undefined;
    }
}

export class InsightEmbed extends CustomElementAdapter<IInsightView> {
    private inFlightRefresh: Promise<void> | undefined;

    private resolveRefresh: (() => void) | undefined;

    private rejectRefresh: ((error: Error) => void) | undefined;

    private refreshSequence = 0;

    static get observedAttributes() {
        return ["workspace", "insight", "locale", "title", "mapbox", "filters"];
    }

    protected override getLiveProperties(): string[] {
        // `insight` stays live so host-set properties are picked up before the first render;
        // the identity list below blocks changing it after the runtime is mounted.
        return ["context", "config", "insight", "filters", "title"];
    }

    protected override getIdentityProperties(): string[] {
        return ["insight"];
    }

    protected override getResolvedContext(): CustomElementContext | undefined {
        const defaultContext = this.getDefaultContextSnapshot();
        const propertyContext = this.getLivePropertyValue<Partial<CustomElementContext>>("context");

        const backend = propertyContext?.backend ?? defaultContext?.backend;
        if (!backend) {
            return undefined;
        }

        return {
            backend,
            workspaceId:
                propertyContext?.workspaceId ?? this.getAttribute("workspace") ?? defaultContext?.workspaceId,
            mapboxToken: propertyContext?.mapboxToken ?? defaultContext?.mapboxToken,
            agGridToken: propertyContext?.agGridToken ?? defaultContext?.agGridToken,
        };
    }

    override async [LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-ext")).InsightView;
    }

    async refresh(): Promise<void> {
        if (this.inFlightRefresh) {
            return this.inFlightRefresh;
        }

        // `resolve`/`reject` publish to `this.resolveRefresh`/`this.rejectRefresh` only after
        // invalidation succeeds and the pre-refresh view is unmounted, right before scheduling
        // the new render. Until then they're `undefined`, so the pre-refresh view's still-firing
        // callbacks (and resetRenderRoot()'s force-flush of them) are no-ops instead of settling
        // this promise early. That covers the old tree's *synchronous* teardown; a pre-refresh
        // fetch that completes later, after these handlers are published, is stopped instead by
        // the render-generation guard in GET_COMPONENT. `this.inFlightRefresh` is set
        // synchronously below, before any `await`, so concurrent refresh() calls keep sharing it
        // regardless.
        let resolve!: () => void;
        let reject!: (error: Error) => void;
        const refreshPromise = new Promise<void>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.inFlightRefresh = refreshPromise;

        try {
            await this.invalidateCachedInsight();
        } catch (error) {
            this.inFlightRefresh = undefined;
            reject(error instanceof Error ? error : new Error(String(error)));
            return refreshPromise;
        }

        this.refreshSequence += 1;
        this.resetRenderRoot();

        this.resolveRefresh = () => {
            this.resolveRefresh = undefined;
            this.rejectRefresh = undefined;
            this.inFlightRefresh = undefined;
            resolve();
        };
        this.rejectRefresh = (error) => {
            this.resolveRefresh = undefined;
            this.rejectRefresh = undefined;
            this.inFlightRefresh = undefined;
            reject(error);
        };

        this.requestRender();
        return refreshPromise;
    }

    /**
     * @remarks
     * Evicts the cached insight definition so the remounted `InsightView` refetches it
     * instead of reading the same cached promise. Skips silently when the workspace or the
     * insight input cannot be resolved yet; remount still proceeds without invalidation.
     *
     * @internal
     */
    private async invalidateCachedInsight(): Promise<void> {
        const workspace = this.getResolvedContext()?.workspaceId;
        const insight = this.getResolvedInputValue<string | ObjRef>("insight");
        if (!workspace || !insight) {
            return;
        }

        // Resolve the ref exactly the way InsightView does, so the cache keys match.
        const ref = typeof insight === "string" ? idRef(insight, "insight") : insight;
        const { clearInsightViewCacheForInsight } = await import("@gooddata/sdk-ui-ext");
        clearInsightViewCacheForInsight(workspace, ref);
    }

    override [GET_COMPONENT](
        Component: IInsightView,
        { backend, workspaceId, mapboxToken, agGridToken }: CustomElementContext,
    ) {
        // Ensure mandatory property is provided
        const insight = this.getResolvedInputValue<string>("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

        // The refresh generation this render belongs to. A pre-refresh view keeps its callback
        // closures after `resetRenderRoot()`, and its in-flight fetch can complete *after*
        // refresh() has published the new handlers - `InsightView` calls `onInsightLoaded` from
        // inside the fetch promise body, which is not cancellation-gated. Every settle below is
        // therefore gated on this generation, so only the remounted view can settle the refresh
        // it belongs to. Event dispatch stays ungated: hosts should still hear from a view that
        // is on screen.
        const renderSequence = this.refreshSequence;

        const extraProps: Partial<ComponentProps<typeof Component>> = {};
        const config = this.getResolvedInsightConfig({ mapboxToken, agGridToken });
        if (config) {
            extraProps.config = config;
        }

        const locale = this.getResolvedInsightLocale();
        if (locale !== undefined) {
            extraProps.locale = locale;
        }

        const showTitle = this.getResolvedInsightTitle();
        if (showTitle !== undefined) {
            extraProps.showTitle = showTitle;
        }

        const filters = this.getResolvedInsightFilters();
        if (filters !== undefined) {
            extraProps.filters = filters;
        }

        return (
            <Component
                key={`${insight}:${renderSequence}`}
                backend={backend}
                workspace={workspaceId}
                insight={insight}
                onDrill={this[EVENT_HANDLER]<IDrillEvent>("drill")}
                onError={(error) => {
                    this[EVENT_HANDLER]<GoodDataSdkError>("error")(error);
                    this.dispatchEvent(
                        new CustomEvent("gd-error", {
                            detail: {
                                phase: "update",
                                insight: this.getResolvedInputValue("insight"),
                                message: error.message,
                                cause: error,
                            },
                            bubbles: false,
                            cancelable: false,
                            composed: false,
                        }),
                    );
                    if (renderSequence === this.refreshSequence) {
                        this.rejectRefresh?.(error);
                    }
                }}
                onExportReady={this[EVENT_HANDLER]<IExportFunction>("exportReady")}
                onLoadingChanged={(loadingState) => {
                    this[EVENT_HANDLER]<ILoadingState>("loadingChanged")(loadingState);
                    if (!loadingState.isLoading && renderSequence === this.refreshSequence) {
                        this.resolveRefresh?.();
                    }
                }}
                onInsightLoaded={(loadedInsight) => {
                    this[EVENT_HANDLER]<IInsight>("insightLoaded")(loadedInsight);
                    if (renderSequence === this.refreshSequence) {
                        this.resolveRefresh?.();
                    }
                }}
                {...extraProps}
            />
        );
    }

    private getResolvedInsightConfig(defaultTokens?: {
        mapboxToken?: string;
        agGridToken?: string;
    }): ComponentProps<IInsightView>["config"] | undefined {
        if (this.hasLivePropertyValue("config")) {
            return this.getLivePropertyValue<ComponentProps<IInsightView>["config"]>("config");
        }

        const bootstrapConfig: NonNullable<ComponentProps<IInsightView>["config"]> = {};
        const mapboxAttr = this.getAttribute("mapbox");
        if (mapboxAttr || defaultTokens?.mapboxToken) {
            bootstrapConfig.mapboxToken = (mapboxAttr || defaultTokens?.mapboxToken) ?? "";
        }

        const agGridAttr = this.getAttribute("agGrid");
        if (agGridAttr || defaultTokens?.agGridToken) {
            bootstrapConfig.agGridToken = (agGridAttr || defaultTokens?.agGridToken) ?? "";
        }

        return Object.keys(bootstrapConfig).length > 0 ? bootstrapConfig : undefined;
    }

    private getResolvedInsightLocale() {
        const localeAttr = this.getAttribute("locale");
        if (localeAttr === null) {
            return undefined;
        }

        return resolveLocale(localeAttr);
    }

    private getResolvedInsightTitle(): InsightTitle | undefined {
        if (this.hasLivePropertyValue("title")) {
            return this.getLivePropertyValue<InsightTitle>("title");
        }

        const titleAttr = this.getAttribute("title");
        if (titleAttr === null) {
            return undefined;
        }

        return titleAttr || true;
    }

    private getResolvedInsightFilters(): IFilter[] | undefined {
        if (this.hasLivePropertyValue("filters")) {
            return this.getLivePropertyValue<IFilter[]>("filters");
        }

        return parseFilters(this.getAttribute("filters"));
    }
}
