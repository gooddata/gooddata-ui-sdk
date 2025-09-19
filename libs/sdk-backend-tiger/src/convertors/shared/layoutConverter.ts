// (C) 2023-2025 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import update from "lodash/update.js";

import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayout,
    IDrillToCustomUrl,
    IInsightWidget,
    IInsightWidgetDefinition,
    IVisualizationSwitcherWidget,
    IVisualizationSwitcherWidgetDefinition,
    idRef,
    isAttributeHierarchyReference,
    isDrillToCustomUrl,
    isInsightWidget,
    isInsightWidgetDefinition,
    isVisualizationSwitcherWidget,
    isVisualizationSwitcherWidgetDefinition,
    objRefToString,
} from "@gooddata/sdk-model";
import { joinDrillUrlParts, splitDrillUrlParts } from "@gooddata/sdk-model/internal";

export interface IPathConverterPair {
    path: LayoutPath;
    converter: (value: any) => any;
}

export interface IWidgetConvertCallback {
    drillToCustomUrlCallback: (
        widget:
            | IInsightWidget
            | IInsightWidgetDefinition
            | IVisualizationSwitcherWidget
            | IVisualizationSwitcherWidgetDefinition,
        path: LayoutPath,
        pathConverterPairs: IPathConverterPair[],
    ) => void;
    ignoredAttributeHierarchiesCallback: (
        widget:
            | IInsightWidget
            | IInsightWidgetDefinition
            | IVisualizationSwitcherWidget
            | IVisualizationSwitcherWidgetDefinition,
        path: LayoutPath,
        pathConverterPairs: IPathConverterPair[],
    ) => void;
    drillDownIntersectionIgnoredAttributesCallback: (
        widget:
            | IInsightWidget
            | IInsightWidgetDefinition
            | IVisualizationSwitcherWidget
            | IVisualizationSwitcherWidgetDefinition,
        path: LayoutPath,
        pathConverterPairs: IPathConverterPair[],
    ) => void;
}

export function collectPathConverterPairs(
    layout: IDashboardLayout,
    converterCallback: IWidgetConvertCallback,
) {
    const pathConverterPairs: IPathConverterPair[] = [];
    walkLayout(layout, {
        widgetCallback: (widget, widgetPath) => {
            if (
                !isInsightWidget(widget) &&
                !isInsightWidgetDefinition(widget) &&
                !isVisualizationSwitcherWidget(widget) &&
                !isVisualizationSwitcherWidgetDefinition(widget)
            ) {
                return;
            }
            converterCallback.drillToCustomUrlCallback(widget, widgetPath, pathConverterPairs);
            converterCallback.ignoredAttributeHierarchiesCallback(widget, widgetPath, pathConverterPairs);
            converterCallback.drillDownIntersectionIgnoredAttributesCallback(
                widget,
                widgetPath,
                pathConverterPairs,
            );
        },
    });

    return pathConverterPairs;
}

export function convertLayout(fromBackend: boolean, layout?: IDashboardLayout) {
    if (!layout) {
        return;
    }

    const callbacks = fromBackend
        ? {
              drillToCustomUrlCallback: getPathConverterForDrillToCustomUrlFromBackend,
              ignoredAttributeHierarchiesCallback: getPathConverterForIgnoredAttributeHierarchiesFromBackend,
              drillDownIntersectionIgnoredAttributesCallback:
                  getPathConverterForDrillDownIntersectionIgnoredAttributesFromBackend,
          }
        : {
              drillToCustomUrlCallback: getPathConverterForDrillToCustomUrlToBackend,
              ignoredAttributeHierarchiesCallback: getPathConverterForIgnoredAttributeHierarchiesToBackend,
              drillDownIntersectionIgnoredAttributesCallback:
                  getPathConverterForDrillDownIntersectionIgnoredAttributesToBackend,
          };

    const paths = collectPathConverterPairs(layout, callbacks);
    if (isEmpty(paths)) {
        return layout;
    }

    return paths.reduce((layout: IDashboardLayout, pathAndConverter: IPathConverterPair) => {
        return update(layout, pathAndConverter.path, pathAndConverter.converter);
    }, layout);
}

function getDrillToCustomUrlPairs(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
    converter: (drill: IDrillToCustomUrl) => IDrillToCustomUrl,
) {
    widget.drills.forEach((drill, drillIndex) => {
        if (!isDrillToCustomUrl(drill)) {
            return;
        }
        pathConverterPairs.push({
            path: [...widgetPath, "drills", drillIndex],
            converter,
        });
    });
    if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
        widget.visualizations.forEach((visualizationWidget, index) => {
            visualizationWidget.drills.forEach((drill, drillIndex) => {
                if (!isDrillToCustomUrl(drill)) {
                    return;
                }
                pathConverterPairs.push({
                    path: [...widgetPath, "visualizations", index, "drills", drillIndex],
                    converter,
                });
            });
        });
    }
}

export function convertTargetUrlPartsToString(drill: IDrillToCustomUrl) {
    return update(drill, ["target", "url"], joinDrillUrlParts);
}

export function getPathConverterForDrillToCustomUrlFromBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    getDrillToCustomUrlPairs(widget, widgetPath, pathConverterPairs, convertTargetUrlPartsToString);
}

//
export function getPathConverterForIgnoredAttributeHierarchiesFromBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.ignoredDrillDownHierarchies?.forEach((reference, index) => {
        if (isAttributeHierarchyReference(reference)) {
            pathConverterPairs.push({
                path: [...widgetPath, "ignoredDrillDownHierarchies", index, "attributeHierarchy"],
                converter: (id: string) => idRef(id, "attributeHierarchy"),
            });
        } else {
            pathConverterPairs.push({
                path: [...widgetPath, "ignoredDrillDownHierarchies", index, "dateHierarchyTemplate"],
                converter: (id: string) => idRef(id, "dateHierarchyTemplate"),
            });
        }
    });
    if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
        widget.visualizations.forEach((visualizationWidget, index) => {
            visualizationWidget.ignoredDrillDownHierarchies?.forEach((reference, refIndex) => {
                if (isAttributeHierarchyReference(reference)) {
                    pathConverterPairs.push({
                        path: [
                            ...widgetPath,
                            "visualizations",
                            index,
                            "ignoredDrillDownHierarchies",
                            refIndex,
                            "attributeHierarchy",
                        ],
                        converter: (id: string) => idRef(id, "attributeHierarchy"),
                    });
                } else {
                    pathConverterPairs.push({
                        path: [
                            ...widgetPath,
                            "visualizations",
                            index,
                            "ignoredDrillDownHierarchies",
                            refIndex,
                            "dateHierarchyTemplate",
                        ],
                        converter: (id: string) => idRef(id, "dateHierarchyTemplate"),
                    });
                }
            });
        });
    }
}

export function getPathConverterForDrillDownIntersectionIgnoredAttributesFromBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.drillDownIntersectionIgnoredAttributes?.forEach((ignoredIntersectionAttributes, index) => {
        if (isAttributeHierarchyReference(ignoredIntersectionAttributes.drillDownReference)) {
            pathConverterPairs.push({
                path: [
                    ...widgetPath,
                    "drillDownIntersectionIgnoredAttributes",
                    index,
                    "drillDownReference",
                    "attributeHierarchy",
                ],
                converter: (id: string) => idRef(id, "attributeHierarchy"),
            });
        } else {
            pathConverterPairs.push({
                path: [
                    ...widgetPath,
                    "drillDownIntersectionIgnoredAttributes",
                    index,
                    "drillDownReference",
                    "dateHierarchyTemplate",
                ],
                converter: (id: string) => idRef(id, "dateHierarchyTemplate"),
            });
        }
    });
    if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
        widget.visualizations.forEach((visualizationWidget, visIndex) => {
            visualizationWidget.drillDownIntersectionIgnoredAttributes?.forEach(
                (ignoredIntersectionAttributes, index) => {
                    if (isAttributeHierarchyReference(ignoredIntersectionAttributes.drillDownReference)) {
                        pathConverterPairs.push({
                            path: [
                                ...widgetPath,
                                "visualizations",
                                visIndex,
                                "drillDownIntersectionIgnoredAttributes",
                                index,
                                "drillDownReference",
                                "attributeHierarchy",
                            ],
                            converter: (id: string) => idRef(id, "attributeHierarchy"),
                        });
                    } else {
                        pathConverterPairs.push({
                            path: [
                                ...widgetPath,
                                "visualizations",
                                visIndex,
                                "drillDownIntersectionIgnoredAttributes",
                                index,
                                "drillDownReference",
                                "dateHierarchyTemplate",
                            ],
                            converter: (id: string) => idRef(id, "dateHierarchyTemplate"),
                        });
                    }
                },
            );
        });
    }
}

function convertTargetUrlToParts(drill: IDrillToCustomUrl) {
    return update(drill, ["target", "url"], splitDrillUrlParts);
}

export function getPathConverterForDrillToCustomUrlToBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    getDrillToCustomUrlPairs(widget, widgetPath, pathConverterPairs, convertTargetUrlToParts);
}

//
export function getPathConverterForIgnoredAttributeHierarchiesToBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.ignoredDrillDownHierarchies?.forEach((reference, index) => {
        if (isAttributeHierarchyReference(reference)) {
            pathConverterPairs.push({
                path: [...widgetPath, "ignoredDrillDownHierarchies", index, "attributeHierarchy"],
                converter: objRefToString,
            });
        } else {
            pathConverterPairs.push({
                path: [...widgetPath, "ignoredDrillDownHierarchies", index, "dateHierarchyTemplate"],
                converter: objRefToString,
            });
        }
    });
    if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
        widget.visualizations.forEach((visualizationWidget, index) => {
            visualizationWidget.ignoredDrillDownHierarchies?.forEach((reference, refIndex) => {
                if (isAttributeHierarchyReference(reference)) {
                    pathConverterPairs.push({
                        path: [
                            ...widgetPath,
                            "visualizations",
                            index,
                            "ignoredDrillDownHierarchies",
                            refIndex,
                            "attributeHierarchy",
                        ],
                        converter: objRefToString,
                    });
                } else {
                    pathConverterPairs.push({
                        path: [
                            ...widgetPath,
                            "visualizations",
                            index,
                            "ignoredDrillDownHierarchies",
                            refIndex,
                            "dateHierarchyTemplate",
                        ],
                        converter: objRefToString,
                    });
                }
            });
        });
    }
}

//
export function getPathConverterForDrillDownIntersectionIgnoredAttributesToBackend(
    widget:
        | IInsightWidget
        | IInsightWidgetDefinition
        | IVisualizationSwitcherWidget
        | IVisualizationSwitcherWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.drillDownIntersectionIgnoredAttributes?.forEach((ignoredIntersectionAttributes, index) => {
        if (isAttributeHierarchyReference(ignoredIntersectionAttributes.drillDownReference)) {
            pathConverterPairs.push({
                path: [
                    ...widgetPath,
                    "drillDownIntersectionIgnoredAttributes",
                    index,
                    "drillDownReference",
                    "attributeHierarchy",
                ],
                converter: objRefToString,
            });
        } else {
            pathConverterPairs.push({
                path: [
                    ...widgetPath,
                    "drillDownIntersectionIgnoredAttributes",
                    index,
                    "drillDownReference",
                    "dateHierarchyTemplate",
                ],
                converter: objRefToString,
            });
        }
    });
    if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
        widget.visualizations.forEach((visualizationWidget, visIndex) => {
            visualizationWidget.drillDownIntersectionIgnoredAttributes?.forEach(
                (ignoredIntersectionAttributes, index) => {
                    if (isAttributeHierarchyReference(ignoredIntersectionAttributes.drillDownReference)) {
                        pathConverterPairs.push({
                            path: [
                                ...widgetPath,
                                "visualizations",
                                visIndex,
                                "drillDownIntersectionIgnoredAttributes",
                                index,
                                "drillDownReference",
                                "attributeHierarchy",
                            ],
                            converter: objRefToString,
                        });
                    } else {
                        pathConverterPairs.push({
                            path: [
                                ...widgetPath,
                                "visualizations",
                                visIndex,
                                "drillDownIntersectionIgnoredAttributes",
                                index,
                                "drillDownReference",
                                "dateHierarchyTemplate",
                            ],
                            converter: objRefToString,
                        });
                    }
                },
            );
        });
    }
}
