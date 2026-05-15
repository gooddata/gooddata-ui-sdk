// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { invariant } from "ts-invariant";

import { type IFilter, type IInsight } from "@gooddata/sdk-model";
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

        this.inFlightRefresh = new Promise<void>((resolve, reject) => {
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
        });

        this.refreshSequence += 1;
        this.resetRenderRoot();
        this.requestRender();
        return this.inFlightRefresh;
    }

    override [GET_COMPONENT](
        Component: IInsightView,
        { backend, workspaceId, mapboxToken, agGridToken }: CustomElementContext,
    ) {
        // Ensure mandatory property is provided
        const insight = this.getResolvedInputValue<string>("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

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
                key={`${insight}:${this.refreshSequence}`}
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
                    this.rejectRefresh?.(error);
                }}
                onExportReady={this[EVENT_HANDLER]<IExportFunction>("exportReady")}
                onLoadingChanged={(loadingState) => {
                    this[EVENT_HANDLER]<ILoadingState>("loadingChanged")(loadingState);
                    if (!loadingState.isLoading) {
                        this.resolveRefresh?.();
                    }
                }}
                onInsightLoaded={(loadedInsight) => {
                    this[EVENT_HANDLER]<IInsight>("insightLoaded")(loadedInsight);
                    this.resolveRefresh?.();
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
