// (C) 2026 GoodData Corporation

import {
    type DateFilterGranularity,
    type FilterContextItem,
    type GenAIUserContextFilter,
    type IAttributeDisplayFormMetadataObject,
    type IGenAIDashboardContext,
    type IGenAIObjectReference,
    type IGenAIUserContext,
    type IGenAIUserContextRelativeDateFilter,
    type IGenAIWidgetDescriptor,
    type IWidget,
    type ObjRef,
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
export function buildDashboardContext(dashboard: IGenAIDashboardContext): IGenAIUserContext {
    return buildContext({
        view: {
            dashboard,
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

            if (type === "absolute" && typeof from === "string" && typeof to === "string") {
                converted.push({
                    title: DateFilterHelpers.getDateFilterRepresentation(
                        {
                            ...filter.dateFilter,
                            type: "absoluteForm",
                            visible: true,
                            localIdentifier: filter.dateFilter.localIdentifier!,
                            from,
                            to,
                        },
                        "en-US",
                        DEFAULT_MESSAGES["en-US"],
                        "full",
                    ),
                    type: "date_filter",
                    using,
                    from,
                    to,
                });
            }

            if (type === "relative" && typeof from === "number" && typeof to === "number") {
                const genAIGranularity = GRANULARITY_TO_GENAI[granularity];
                if (genAIGranularity) {
                    converted.push({
                        title: DateFilterHelpers.getDateFilterRepresentation(
                            {
                                ...filter.dateFilter,
                                type: "relativeForm",
                                visible: true,
                                localIdentifier: filter.dateFilter.localIdentifier!,
                                from,
                                to,
                            },
                            "en-US",
                            DEFAULT_MESSAGES["en-US"],
                            "full",
                        ),
                        granularity: genAIGranularity,
                        type: "date_filter",
                        using,
                        from,
                        to,
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
    widgetsMap: Pick<Map<ObjRef, IWidget>, "values" | "get">,
    resultsIdMap?: Pick<Map<string, string | undefined>, "values" | "get">,
): { widgets: IGenAIWidgetDescriptor[]; referencedObjects: IGenAIObjectReference[] } {
    const widgets: IGenAIWidgetDescriptor[] = [];
    const referencedObjects: IGenAIObjectReference[] = [];

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
                    }),
                );
                referencedObjects.push({ type: "WIDGET", ref: widget.ref, title: widget.title });
            }
        }
        if (isVisualizationSwitcherWidget(widget)) {
            const activeVisualization = widget.visualizations[0];
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
                        // All child insights, so the BE can execute the non-active children
                        // (which have no cached result).
                        visualizations: widget.visualizations.map((v) =>
                            buildWidgetContext(v.title, v.ref, "insight", {
                                insightRef: v.insight,
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
