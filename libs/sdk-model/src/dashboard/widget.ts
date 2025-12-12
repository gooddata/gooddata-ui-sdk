// (C) 2020-2025 GoodData Corporation
import { isEmpty } from "lodash-es";
import { invariant } from "ts-invariant";

import {
    type AnalyticalWidgetType,
    type IAnalyticalWidget,
    type IInsightWidget,
    type IInsightWidgetDefinition,
    type IKpiWidget,
    type IKpiWidgetDefinition,
    type IRichTextWidget,
    type IRichTextWidgetDefinition,
    type IVisualizationSwitcherWidget,
    type IVisualizationSwitcherWidgetDefinition,
} from "./analyticalWidgets.js";
import { type ObjRef, isObjRef } from "../objRef/index.js";

/**
 * See {@link IWidget}]
 * @public
 */
export type IWidgetDefinition =
    | IKpiWidgetDefinition
    | IInsightWidgetDefinition
    | IRichTextWidgetDefinition
    | IVisualizationSwitcherWidgetDefinition;

/**
 * @public
 */
export type IWidget = IKpiWidget | IInsightWidget | IRichTextWidget | IVisualizationSwitcherWidget;

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidgetDefinition}.
 * @alpha
 */
export function isWidgetDefinition(obj: unknown): obj is IWidgetDefinition {
    return hasWidgetProps(obj) && !isObjRef((obj as any).ref);
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IWidget}.
 * @alpha
 */
export function isWidget(obj: unknown): obj is IWidget {
    return hasWidgetProps(obj) && isObjRef((obj as any).ref);
}

/**
 * @internal
 */
function hasWidgetProps(obj: unknown): boolean {
    return (
        !isEmpty(obj) &&
        (["kpi", "richText", "insight", "visualizationSwitcher"] as IAnalyticalWidget["type"][]).some(
            (x) => (obj as IAnalyticalWidget).type === x,
        )
    );
}

/**
 * Gets the widget identifier
 *
 * @param widget - widget to get identifier of
 * @returns the widget identifier
 * @alpha
 */
export function widgetId(widget: IWidget): string {
    invariant(widget, "widget to get identifier of must be specified");

    return widget.identifier;
}

/**
 * Gets the widget uri
 *
 * @param widget - widget to get uri of
 * @returns the widget uri
 * @alpha
 */
export function widgetUri(widget: IWidget): string {
    invariant(widget, "widget to get uri of must be specified");

    return widget.uri;
}

/**
 * Gets the widget ref
 *
 * @param widget - widget to get ref of
 * @returns the widget ref
 * @alpha
 */
export function widgetRef(widget: IWidget): ObjRef {
    invariant(widget, "widget to get ref of must be specified");

    return widget.ref;
}

/**
 * Gets the widget type
 *
 * @param widget - widget to get type of
 * @returns the widget type
 * @alpha
 */
export function widgetType(widget: IWidget): AnalyticalWidgetType {
    invariant(widget, "widget to get type of must be specified");

    return widget.type;
}

/**
 * Gets the widget title
 *
 * @param widget - widget to get title of
 * @returns the widget title
 * @public
 */
export function widgetTitle(widget: IWidget): string {
    invariant(widget, "widget to get title of must be specified");

    return widget.title;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IInsightWidget}.
 * @alpha
 */
export function isInsightWidget(obj: unknown): obj is IInsightWidget {
    return isWidget(obj) && (obj as IInsightWidget).type === "insight";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IInsightWidgetDefinition}.
 * @alpha
 */
export function isInsightWidgetDefinition(obj: unknown): obj is IInsightWidgetDefinition {
    return isWidgetDefinition(obj) && (obj as IInsightWidget).type === "insight";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWidget}.
 * @alpha
 */
export function isKpiWidget(obj: unknown): obj is IKpiWidget {
    return isWidget(obj) && (obj as IKpiWidget).type === "kpi";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IKpiWidget}.
 * @alpha
 */
export function isKpiWidgetDefinition(obj: unknown): obj is IKpiWidgetDefinition {
    return isWidgetDefinition(obj) && (obj as IKpiWidget).type === "kpi";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IRichTextWidget}.
 * @alpha
 */
export function isRichTextWidget(obj: unknown): obj is IRichTextWidget {
    return isWidget(obj) && (obj as IRichTextWidget).type === "richText";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IRichTextWidgetDefinition}.
 * @alpha
 */
export function isRichTextWidgetDefinition(obj: unknown): obj is IRichTextWidgetDefinition {
    return isWidgetDefinition(obj) && (obj as IRichTextWidgetDefinition).type === "richText";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IVisualizationSwitcherWidget}.
 * @alpha
 */
export function isVisualizationSwitcherWidget(obj: unknown): obj is IVisualizationSwitcherWidget {
    return isWidget(obj) && (obj as IVisualizationSwitcherWidget).type === "visualizationSwitcher";
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IVisualizationSwitcherWidgetDefinition}.
 * @alpha
 */
export function isVisualizationSwitcherWidgetDefinition(
    obj: unknown,
): obj is IVisualizationSwitcherWidgetDefinition {
    return (
        isWidgetDefinition(obj) &&
        (obj as IVisualizationSwitcherWidgetDefinition).type === "visualizationSwitcher"
    );
}
