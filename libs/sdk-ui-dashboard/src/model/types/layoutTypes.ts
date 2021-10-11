// (C) 2021 GoodData Corporation

import {
    IBaseWidget,
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    IDashboardObjectIdentity,
    isWidget,
    IWidget,
    IWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty";

/**
 * Base type for custom widgets. Custom widgets may extend this and add extra properties to hold widget-specific
 * configuration.
 *
 * @alpha
 */
export interface ICustomWidgetBase extends IBaseWidget {
    readonly type: "customWidget";
    readonly customType: string;
}

/**
 * Custom widget with assigned identity.
 *
 * @alpha
 */
export interface ICustomWidget extends ICustomWidgetBase, IDashboardObjectIdentity {}

/**
 * Definition of custom widget. The definition may not specify identity. In that case a temporary identity
 * will be assigned to the widget as it is added onto a dashboard.
 *
 * @alpha
 */
export interface ICustomWidgetDefinition extends ICustomWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * Creates a new custom widget.
 *
 * @param identifier - identifier for custom widget; once added onto a dashboard, widget will be referencable using this identifier
 * @param customType - custom widget type
 * @param extras - optionally provide extra data to include on the custom widget; the content of this argument can be an
 *  arbitrary plain object
 * @alpha
 */
export function newCustomWidget<TExtra = void>(
    identifier: string,
    customType: string,
    extras?: TExtra,
): TExtra & ICustomWidget {
    return {
        type: "customWidget",
        customType,
        identifier,
        uri: `_custom_widget_uri/${identifier}`,
        ref: idRef(identifier),
        ...extras,
    } as TExtra & ICustomWidget;
}

/**
 * Type-guard that tests whether an object is an instance of {@link ICustomWidget}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isCustomWidget(obj: unknown): obj is ICustomWidget {
    const w = obj as ICustomWidget;

    return !isEmpty(w) && w.type === "customWidget" && w.customType !== undefined && w.ref !== undefined;
}

/**
 * Type-guard that tests whether an object is an instance of {@link ICustomWidgetDefinition}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isCustomWidgetDefinition(obj: unknown): obj is ICustomWidget {
    const w = obj as ICustomWidget;

    return !isEmpty(w) && w.type === "customWidget" && w.customType !== undefined && w.ref === undefined;
}

/**
 * Dumps debug information about a widget into a string.
 *
 * @param widget - widget to dump info from
 * @alpha
 */
export function extendedWidgetDebugStr(widget: ExtendedDashboardWidget): string {
    const widgetId = `${widget.identifier}`;
    let widgetType: string = "unknown widget type";

    if (isWidget(widget)) {
        widgetType = widget.type;
    } else if (isCustomWidget(widget)) {
        widgetType = `${widget.type}/${widget.customType}`;
    }

    return `${widgetId}(${widgetType})`;
}

/**
 * Extension of the default {@link @gooddata/sdk-backend-spi#IWidget} type to also include view-only
 * custom widget types.
 *
 * @alpha
 */
export type ExtendedDashboardWidget = IWidget | ICustomWidget;

/**
 * Specialization of the IDashboardLayoutItem which also includes the extended dashboard widgets - KPI and
 * Insight placeholders.
 *
 * @alpha
 */
export type ExtendedDashboardItem<T = ExtendedDashboardWidget> = IDashboardLayoutItem<T>;

/**
 * Identifier of a stashed dashboard items. When removing one or more item, the caller may decide to 'stash' these items
 * under some identifier. This stashed items can then be used in subsequent command that places items on the layout by
 * providing the stash identifier.
 *
 * @alpha
 */
export type StashedDashboardItemsId = string;

/**
 * Tests whether object is an instance of {@link StashedDashboardItemsId};
 *
 * @param obj - object to test
 * @alpha
 */
export function isStashedDashboardItemsId(obj: unknown): obj is StashedDashboardItemsId {
    return typeof obj === "string";
}

/**
 * This is a mark-up type that is used for properties and arguments that can contain relative index: a zero-based index
 * with added convenience of referencing last spot using index of `-1`.
 *
 * @alpha
 */
export type RelativeIndex = number;

/**
 * Definition of items that may be placed into the dashboard sections.
 *
 * @alpha
 */
export type DashboardItemDefinition =
    | ExtendedDashboardItem<ExtendedDashboardWidget | IWidgetDefinition | ICustomWidgetDefinition>
    | StashedDashboardItemsId;

/**
 * This type should be used in handlers that add new items onto dashboard.
 *
 * First thing those handlers need to do is to assign a temporary identity to all new KPI and Insight widget
 * definitions -> thus ensure that anything that gets added onto a dashboard has identifier and can be referenced.
 *
 * This type narrows down the DashboardItemDefinition to contain just KPI and Insight widgets that have identity.
 *
 * @internal
 */
export type InternalDashboardItemDefinition = ExtendedDashboardItem | StashedDashboardItemsId;

/**
 * Dashboard layout section that can contain extended set of items - including KPI and Insight placeholders.
 *
 * @alpha
 */
export type ExtendedDashboardLayoutSection = IDashboardLayoutSection<ExtendedDashboardWidget>;
