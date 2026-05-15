// (C) 2022-2026 GoodData Corporation

import { type ComponentProps } from "react";

import { invariant } from "ts-invariant";

import { type IInsight } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    type IDrillEvent,
    type IExportFunction,
    type ILoadingState,
    resolveLocale,
} from "@gooddata/sdk-ui";
import type { InsightView } from "@gooddata/sdk-ui-ext";

import {
    LEGACY_EVENT_HANDLER,
    LEGACY_GET_COMPONENT,
    LEGACY_LOAD_COMPONENT,
    LegacyCustomElementAdapter,
} from "../common/LegacyCustomElementAdapter.js";
import { stringToFilters } from "../common/typeGuards/stringToFilters.js";
import { type CustomElementContext } from "../context.js";

type IInsightView = typeof InsightView;

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

export class Insight extends LegacyCustomElementAdapter<IInsightView> {
    static get observedAttributes() {
        return ["workspace", "insight", "locale", "title", "mapbox", "filters"];
    }

    async [LEGACY_LOAD_COMPONENT]() {
        return (await import("@gooddata/sdk-ui-ext")).InsightView;
    }

    [LEGACY_GET_COMPONENT](
        Component: IInsightView,
        { backend, workspaceId, mapboxToken, agGridToken }: CustomElementContext,
    ) {
        const insight = this.getAttribute("insight");
        invariant(insight, '"insight" is a mandatory attribute and it cannot be empty');

        const extraProps: Partial<ComponentProps<typeof Component>> = { config: {} };

        const localeAttr = this.getAttribute("locale");
        if (localeAttr !== null) {
            extraProps.locale = resolveLocale(localeAttr);
        }

        const titleAttr = this.getAttribute("title");
        if (titleAttr !== null) {
            extraProps.showTitle = titleAttr || true;
        }

        const mapboxAttr = this.getAttribute("mapbox");
        if (mapboxAttr || mapboxToken) {
            extraProps.config!.mapboxToken = (mapboxAttr || mapboxToken) ?? "";
        }

        const agGridAttr = this.getAttribute("agGrid");
        if (agGridAttr || agGridToken) {
            extraProps.config!.agGridToken = (agGridAttr || agGridToken) ?? "";
        }

        const filters = parseFilters(this.getAttribute("filters"));
        if (filters) {
            extraProps.filters = filters;
        }

        return (
            <Component
                backend={backend}
                workspace={workspaceId}
                insight={insight}
                onDrill={this[LEGACY_EVENT_HANDLER]<IDrillEvent>("drill")}
                onError={this[LEGACY_EVENT_HANDLER]<GoodDataSdkError>("error")}
                onExportReady={this[LEGACY_EVENT_HANDLER]<IExportFunction>("exportReady")}
                onLoadingChanged={this[LEGACY_EVENT_HANDLER]<ILoadingState>("loadingChanged")}
                onInsightLoaded={this[LEGACY_EVENT_HANDLER]<IInsight>("insightLoaded")}
                {...extraProps}
            />
        );
    }
}
