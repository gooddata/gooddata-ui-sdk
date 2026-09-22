// (C) 2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type FilterContextItem,
    type GenAIUserContextFilter,
    type IAttributeDisplayFormMetadataObject,
    type IDashboardDefinition,
    type IGenAIDashboardContext,
    type IGenAIObjectReference,
    type IGenAIUserContext,
    type IGenAIUserContextRelativeDateFilter,
    type IGenAIWidgetDescriptor,
    type IInsight,
    type IWidget,
    type ObjRef,
    insightVisualizationUrl,
    isAttributeElementsByRef,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    isInsightWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { DEFAULT_MESSAGES } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

import { buildContext } from "./build.js";

/**
 * @internal
 */
export function buildDashboardContext(
    dashboard: Omit<IGenAIDashboardContext, "definition">,
    definition?: IDashboardDefinition,
): IGenAIUserContext {
    return buildContext({
        view: {
            dashboard: {
                ...dashboard,
                ...(definition ? { definition } : {}),
            },
        },
    });
}

/**
 * @internal
 */
export function buildWidgetContext(
    title: string,
    widgetRef: ObjRef,
    widgetType: "insight" | "visualizationSwitcher" | "richText",
    props?: Partial<Omit<IGenAIWidgetDescriptor, "title" | "widgetRef" | "widgetType">>,
): IGenAIWidgetDescriptor {
    return {
        title,
        widgetRef,
        widgetType,
        ...props,
    };
}

/**
 * @internal
 */
export function buildFiltersContext(
    filters: FilterContextItem[],
    displayForms?: Pick<Map<ObjRef, IAttributeDisplayFormMetadataObject>, "get">,
): GenAIUserContextFilter[] {
    const converted: GenAIUserContextFilter[] = [];

    for (const filter of filters) {
        if (isDashboardAttributeFilter(filter)) {
            const { displayForm, negativeSelection, attributeElements, title } = filter.attributeFilter;
            const elements = isAttributeElementsByRef(attributeElements)
                ? attributeElements.uris
                : attributeElements.values;

            const values = (elements ?? []).filter((value): value is string => value != null);
            if (values.length > 0) {
                converted.push({
                    type: "attribute_filter",
                    using: objRefToString(displayForm),
                    state: negativeSelection ? { exclude: values } : { include: values },
                    title: title ?? displayForms?.get(displayForm)?.title,
                });
            }
        }
        if (isDashboardDateFilter(filter)) {
            const { type, granularity, from, to, dataSet } = filter.dateFilter;
            const using = dataSet ? objRefToString(dataSet) : undefined;

            if (type === "absolute") {
                const convertedFrom = String(from);
                const convertedTo = String(to);
                converted.push({
                    title: DateFilterHelpers.getDateFilterRepresentation(
                        {
                            ...filter.dateFilter,
                            type: "absoluteForm",
                            visible: true,
                            localIdentifier: filter.dateFilter.localIdentifier!,
                            from: convertedFrom,
                            to: convertedTo,
                        },
                        "en-US",
                        DEFAULT_MESSAGES["en-US"],
                        "full",
                    ),
                    using,
                    type: "date_filter",
                    from: convertedFrom,
                    to: convertedTo,
                });
            }

            if (type === "relative") {
                const genAIGranularity = GRANULARITY_TO_GENAI[granularity];
                if (genAIGranularity && from !== undefined && to !== undefined) {
                    const convertedFrom = typeof from === "number" ? from : parseInt(String(from), 10);
                    const convertedTo = typeof to === "number" ? to : parseInt(String(to), 10);
                    converted.push({
                        title: DateFilterHelpers.getDateFilterRepresentation(
                            {
                                ...filter.dateFilter,
                                type: "relativeForm",
                                visible: true,
                                localIdentifier: filter.dateFilter.localIdentifier!,
                                from: convertedFrom,
                                to: convertedTo,
                            },
                            "en-US",
                            DEFAULT_MESSAGES["en-US"],
                            "full",
                        ),
                        using,
                        granularity: genAIGranularity,
                        type: "date_filter",
                        from: convertedFrom,
                        to: convertedTo,
                    });
                }
            }
        }
    }

    return converted;
}

/**
 * @internal
 */
export function buildWidgetsContext(
    widgetsMap: Pick<Map<ObjRef, IWidget>, "values" | "get"> | undefined,
    resultsIdMap?: Pick<Map<string, string | undefined>, "values" | "get">,
    visualizationSwitcherActiveVisualizations?: Record<string, string>,
    insightsMap?: Pick<Map<ObjRef, IInsight>, "get">,
    widgetFilters?: Map<string, GenAIUserContextFilter[]>,
): { widgets: IGenAIWidgetDescriptor[]; referencedObjects: IGenAIObjectReference[] } {
    const widgets: IGenAIWidgetDescriptor[] = [];
    const referencedObjects: IGenAIObjectReference[] = [];

    if (!widgetsMap) {
        return { widgets, referencedObjects };
    }

    const switcherChildRefs = new Set<string>();
    for (const widget of widgetsMap.values()) {
        if (isVisualizationSwitcherWidget(widget)) {
            for (const visualization of widget.visualizations) {
                switcherChildRefs.add(serializeObjRef(visualization.ref));
            }
        }
    }

    for (const widget of widgetsMap.values()) {
        if (isInsightWidget(widget)) {
            if (!switcherChildRefs.has(serializeObjRef(widget.ref))) {
                widgets.push(
                    buildWidgetContext(widget.title, widget.ref, "insight", {
                        insightRef: widget.insight,
                        resultId: resultsIdMap?.get(serializeObjRef(widget.ref)),
                        ...visualizationUrlOf(insightsMap, widget.insight),
                        filters: widgetFilters?.get(serializeObjRef(widget.ref)),
                    }),
                );
                referencedObjects.push({ type: "WIDGET", ref: widget.ref, title: widget.title });
            }
        }
        if (isVisualizationSwitcherWidget(widget)) {
            const activeVisualizationId =
                visualizationSwitcherActiveVisualizations?.[objRefToString(widget.ref)];
            const activeVisualization =
                widget.visualizations.find((v) => v.identifier === activeVisualizationId) ??
                widget.visualizations[0];
            widgets.push(
                buildWidgetContext(
                    widget.title || activeVisualization?.title,
                    widget.ref,
                    "visualizationSwitcher",
                    {
                        insightRef: activeVisualization?.insight,
                        resultId: activeVisualization
                            ? resultsIdMap?.get(serializeObjRef(activeVisualization.ref))
                            : undefined,
                        ...visualizationUrlOf(insightsMap, activeVisualization?.insight),
                        filters: widgetFilters?.get(serializeObjRef(widget.ref)),
                        // All child insights, so the BE can execute the non-active children
                        // (which have no cached result).
                        visualizations: widget.visualizations.map((v) =>
                            buildWidgetContext(v.title, v.ref, "insight", {
                                insightRef: v.insight,
                                ...visualizationUrlOf(insightsMap, v.insight),
                                filters: widgetFilters?.get(serializeObjRef(v.ref)),
                            }),
                        ),
                    },
                ),
            );
            referencedObjects.push({
                type: "WIDGET",
                ref: widget.ref,
                title: widget.title || activeVisualization?.title,
            });
        }
        if (isRichTextWidget(widget)) {
            widgets.push(
                buildWidgetContext(widget.title, widget.ref, "richText", {
                    content: widget.content,
                }),
            );
        }
    }

    return { widgets, referencedObjects };
}

//utils

function visualizationUrlOf(
    insightsMap: Pick<Map<ObjRef, IInsight>, "get"> | undefined,
    insightRef: ObjRef | undefined,
): { visualizationUrl?: string } {
    const insight = insightRef ? insightsMap?.get(insightRef) : undefined;

    return insight ? { visualizationUrl: insightVisualizationUrl(insight) } : {};
}

type GenAIRelativeGranularity = IGenAIUserContextRelativeDateFilter["granularity"];

const GRANULARITY_TO_GENAI: Partial<Record<DateFilterGranularity, GenAIRelativeGranularity>> = {
    "GDC.time.minute": "MINUTE",
    "GDC.time.hour": "HOUR",
    "GDC.time.date": "DAY",
    "GDC.time.week_us": "WEEK_US",
    "GDC.time.month": "MONTH",
    "GDC.time.quarter": "QUARTER",
    "GDC.time.year": "YEAR",
};
