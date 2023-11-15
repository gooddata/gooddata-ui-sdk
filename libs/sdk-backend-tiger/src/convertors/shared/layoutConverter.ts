// (C) 2023 GoodData Corporation

import {
    IDashboardLayout,
    idRef,
    IDrillToCustomUrl,
    IInsightWidget,
    IInsightWidgetDefinition,
    isAttributeHierarchyReference,
    isDrillToCustomUrl,
    isInsightWidget,
    isInsightWidgetDefinition,
    objRefToString,
} from "@gooddata/sdk-model";
import { LayoutPath, walkLayout } from "@gooddata/sdk-backend-spi";
import { joinDrillUrlParts, splitDrillUrlParts } from "@gooddata/sdk-model/internal";
import isEmpty from "lodash/isEmpty.js";
import update from "lodash/fp/update.js";

export interface IPathConverterPair {
    path: LayoutPath;
    converter: (value: any) => any;
}

export interface IWidgetConvertCallback {
    drillToCustomUrlCallback: (
        widget: IInsightWidget | IInsightWidgetDefinition,
        path: LayoutPath,
        pathConverterPairs: IPathConverterPair[],
    ) => void;
    ignoredAttributeHierarchiesCallback: (
        widget: IInsightWidget | IInsightWidgetDefinition,
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
            if (!isInsightWidget(widget) && !isInsightWidgetDefinition(widget)) {
                return;
            }
            converterCallback.drillToCustomUrlCallback(widget, widgetPath, pathConverterPairs);
            converterCallback.ignoredAttributeHierarchiesCallback(widget, widgetPath, pathConverterPairs);
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
          }
        : {
              drillToCustomUrlCallback: getPathConverterForDrillToCustomUrlToBackend,
              ignoredAttributeHierarchiesCallback: getPathConverterForIgnoredAttributeHierarchiesToBackend,
          };

    const paths = collectPathConverterPairs(layout, callbacks);
    if (isEmpty(paths)) {
        return layout;
    }

    return paths.reduce((layout: IDashboardLayout, pathAndConverter: IPathConverterPair) => {
        return update(pathAndConverter.path, pathAndConverter.converter, layout);
    }, layout);
}

export function convertTargetUrlPartsToString(drill: IDrillToCustomUrl) {
    return update(["target", "url"], joinDrillUrlParts, drill);
}

export function getPathConverterForDrillToCustomUrlFromBackend(
    widget: IInsightWidget | IInsightWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.drills.forEach((drill, drillIndex) => {
        if (!isDrillToCustomUrl(drill)) {
            return;
        }
        pathConverterPairs.push({
            path: [...widgetPath, "drills", drillIndex],
            converter: convertTargetUrlPartsToString,
        });
    });
}

export function getPathConverterForIgnoredAttributeHierarchiesFromBackend(
    widget: IInsightWidget | IInsightWidgetDefinition,
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
                converter: (id: string) => idRef(id, "attributeHierarchy"),
            });
        }
    });
}

function convertTargetUrlToParts(drill: IDrillToCustomUrl) {
    return update(["target", "url"], splitDrillUrlParts, drill);
}

export function getPathConverterForDrillToCustomUrlToBackend(
    widget: IInsightWidget | IInsightWidgetDefinition,
    widgetPath: LayoutPath,
    pathConverterPairs: IPathConverterPair[],
) {
    widget.drills.forEach((drill, drillIndex) => {
        if (!isDrillToCustomUrl(drill)) {
            return;
        }
        pathConverterPairs.push({
            path: [...widgetPath, "drills", drillIndex],
            converter: convertTargetUrlToParts,
        });
    });
}

export function getPathConverterForIgnoredAttributeHierarchiesToBackend(
    widget: IInsightWidget | IInsightWidgetDefinition,
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
}
