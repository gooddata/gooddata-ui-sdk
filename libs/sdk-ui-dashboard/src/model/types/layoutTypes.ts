// (C) 2021-2023 GoodData Corporation

import {
    idRef,
    IDashboardObjectIdentity,
    IBaseWidget,
    IFilterableWidget,
    IWidget,
    IWidgetDefinition,
    isWidget,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSizeByScreenSize,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";

/**
 * Base type for custom widgets. Custom widgets may extend this and add extra properties to hold widget-specific
 * configuration.
 *
 * @public
 */
export interface ICustomWidgetBase extends IBaseWidget {
    readonly type: "customWidget";
    readonly customType: string;
}

/**
 * Custom widget with assigned identity.
 *
 * @public
 */
export interface ICustomWidget
    extends ICustomWidgetBase,
        IDashboardObjectIdentity,
        Partial<IFilterableWidget> {}

/**
 * Definition of custom widget. The definition may not specify identity. In that case a temporary identity
 * will be assigned to the widget as it is added onto a dashboard.
 *
 * @public
 */
export interface ICustomWidgetDefinition extends ICustomWidgetBase, Partial<IDashboardObjectIdentity> {}

/**
 * Creates a new custom widget.
 *
 * @param identifier - identifier for custom widget; once added onto a dashboard, widget will be referencable using this identifier
 * @param customType - custom widget type
 * @param extras - provide extra data to include on the custom widget; the content of this argument can be an
 *  arbitrary plain object. note: the factory will make a copy of all the extra data. at this moment it is not possible
 *  to modify the data once the widget is added onto a dashboard.
 * @public
 */
export function newCustomWidget<TExtra = void>(
    identifier: string,
    customType: string,
    extras?: TExtra & Partial<IFilterableWidget>,
): TExtra & ICustomWidget {
    const extrasCopy = extras ? cloneDeep(extras) : {};

    return {
        type: "customWidget",
        customType,
        identifier,
        uri: `_custom_widget_uri/${identifier}`,
        ref: idRef(identifier),
        ...extrasCopy,
    } as TExtra & ICustomWidget;
}

/**
 * Type-guard that tests whether an object is an instance of {@link ICustomWidget}.
 *
 * @param obj - object to test
 * @public
 */
export function isCustomWidget(obj: unknown): obj is ICustomWidget {
    const w = obj as ICustomWidget;

    return !isEmpty(w) && w.type === "customWidget" && w.customType !== undefined && w.ref !== undefined;
}

/**
 * Type-guard that tests whether an object is an instance of {@link ICustomWidgetDefinition}.
 *
 * @param obj - object to test
 * @public
 */
export function isCustomWidgetDefinition(obj: unknown): obj is ICustomWidgetDefinition {
    const w = obj as ICustomWidget;

    return !isEmpty(w) && w.type === "customWidget" && w.customType !== undefined && w.ref === undefined;
}

/**
 * Type-guard that tests whether an object is an instance of {@link ICustomWidgetBase}.
 *
 * @param obj - object to test
 * @public
 */
export function isCustomWidgetBase(obj: unknown): obj is ICustomWidgetBase {
    const w = obj as ICustomWidgetBase;

    return !isEmpty(w) && w.type === "customWidget" && w.customType !== undefined;
}

/**
 * Dumps debug information about a widget into a string.
 *
 * @param widget - widget to dump info from
 * @internal
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
 * @public
 */
export type ExtendedDashboardWidget = IWidget | ICustomWidget;

/**
 * Specialization of the IDashboardLayoutItem which also includes the extended dashboard widgets - KPI and
 * Insight placeholders.
 *
 * @public
 */
export type ExtendedDashboardItem<T = ExtendedDashboardWidget> = IDashboardLayoutItem<T>;

/**
 * Utility type to get the widget type from a given {@link ExtendedDashboardItem} type.
 * @public
 */
export type ExtendedDashboardItemType<T> = T extends ExtendedDashboardItem<infer S> ? S : never;

/**
 * Utility type to get the widget type from a given {@link ExtendedDashboardItem} array.
 * @public
 */
export type ExtendedDashboardItemTypes<T extends ReadonlyArray<ExtendedDashboardItem<unknown>>> = {
    [K in keyof T]: ExtendedDashboardItemType<T[K]>;
}[number];

/**
 * Creates a new dashboard item containing the provided custom widget.
 *
 * @param widget - custom widget to include
 * @param sizeOrColSize - item size specification; for convenience you can specify the size as number which will be
 *  interpreted as number of columns in a 12-col grid that the item should use when rendered on an XL screen.
 * @public
 */
export function newDashboardItem<T = ExtendedDashboardWidget>(
    widget: T,
    sizeOrColSize: IDashboardLayoutSizeByScreenSize | number,
): ExtendedDashboardItem<T> {
    const size: IDashboardLayoutSizeByScreenSize =
        typeof sizeOrColSize === "number" ? { xl: { gridWidth: sizeOrColSize } } : sizeOrColSize;

    return {
        type: "IDashboardLayoutItem",
        size,
        widget: cloneDeep(widget),
    };
}

function getOrCreateSectionHeader(
    titleOrHeader: IDashboardLayoutSectionHeader | string | undefined,
): IDashboardLayoutSectionHeader | undefined {
    if (!titleOrHeader) {
        return undefined;
    }

    if (typeof titleOrHeader === "string") {
        if (isEmpty(titleOrHeader)) {
            return undefined;
        }

        return {
            title: titleOrHeader,
        };
    }

    return titleOrHeader;
}

/**
 * Creates a new dashboard section.
 *
 * @param titleOrHeader - header to use for this section (if any); for convenience, you may provide just string containing the title instead
 * of specifying full header. if you specify empty string for title, then there will be no header.
 * @param items - dashboard items to include in the section; note: a deep copy of each item will be used on the new section
 *
 * @public
 */
export function newDashboardSection<T extends ReadonlyArray<ExtendedDashboardItem<unknown>>>(
    titleOrHeader: IDashboardLayoutSectionHeader | string | undefined,
    ...items: T
): IDashboardLayoutSection<ExtendedDashboardItemTypes<T>> {
    const header = getOrCreateSectionHeader(titleOrHeader);
    const itemsClone = cloneDeep(items) as any;

    return {
        type: "IDashboardLayoutSection",
        items: itemsClone,
        header,
    };
}

/**
 * Identifier of a stashed dashboard items. When removing one or more item, the caller may decide to 'stash' these items
 * under some identifier. This stashed items can then be used in subsequent command that places items on the layout by
 * providing the stash identifier.
 *
 * @beta
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
 * @beta
 */
export type RelativeIndex = number;

/**
 * Definition of items that may be placed into the dashboard sections.
 *
 * @beta
 */
export type DashboardItemDefinition =
    | ExtendedDashboardItem<ExtendedDashboardWidget | IWidgetDefinition | ICustomWidgetDefinition>
    | StashedDashboardItemsId;

/**
 * This type should be used in handlers that add new items onto dashboard.
 *
 * First thing those handlers need to do is to assign a temporary identity to all new KPI and Insight widget
 * definitions → thus ensure that anything that gets added onto a dashboard has identifier and can be referenced.
 *
 * This type narrows down the DashboardItemDefinition to contain just KPI and Insight widgets that have identity.
 *
 * @internal
 */
export type InternalDashboardItemDefinition = ExtendedDashboardItem | StashedDashboardItemsId;

/**
 * Dashboard layout section that can contain extended set of items - including KPI and Insight placeholders.
 *
 * @public
 */
export type ExtendedDashboardLayoutSection = IDashboardLayoutSection<ExtendedDashboardWidget>;
