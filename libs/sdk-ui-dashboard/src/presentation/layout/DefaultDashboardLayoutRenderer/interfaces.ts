// (C) 2019-2023 GoodData Corporation
import { IDashboardLayout, IDashboardWidget, ScreenSize } from "@gooddata/sdk-model";
import { RenderMode } from "../../../types.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";

/**
 * Default props provided to {@link IDashboardLayoutSectionKeyGetter}.
 *
 * @alpha
 */
export type IDashboardLayoutSectionKeyGetterProps<TWidget = IDashboardWidget> = {
    /**
     * Dashboard layout section.
     */
    section: IDashboardLayoutSectionFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;
};

/**
 * Dashboard layout section key getter.
 * This callback is used to determine a unique key of the section.
 * By this callback, you can avoid unnecessary re-renders of the section components,
 * the returned unique key is passed to the React "key" property, when rendering rows.
 * By default, dashboard layout will use sectionIndex as a unique key.
 *
 * @alpha
 */
export type IDashboardLayoutSectionKeyGetter<TWidget = IDashboardWidget> = (
    props: IDashboardLayoutSectionKeyGetterProps<TWidget>,
) => string;

/**
 * Default props provided to {@link IDashboardLayoutSectionRenderer}.
 *
 * @alpha
 */
export interface IDashboardLayoutSectionRenderProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout section.
     */
    section: IDashboardLayoutSectionFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;

    /**
     * Default renderer of the section - can be used as a fallback for custom sectionRenderer.
     */
    DefaultSectionRenderer: IDashboardLayoutSectionRenderer<TWidget>;

    /**
     * Columns rendered by columnRenderer.
     */
    children: React.ReactNode;

    /**
     * Dashboard render mode
     */
    renderMode: RenderMode;

    /**
     * Additional section css class name.
     */
    className?: string;

    /**
     * Enable debug mode? (In debug mode, sections & items are highlighted for better overview of the layout structure).
     */
    debug?: boolean;

    /**
     * Is hidden section? Use this to hide the section without remounting it.
     */
    isHidden?: boolean;
}

/**
 * Dashboard layout section renderer.
 * Represents a component for rendering the section.
 *
 * @alpha
 */
export type IDashboardLayoutSectionRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutSectionRenderProps<TWidget> & TCustomProps,
) => JSX.Element;

/**
 * Default props provided to {@link IDashboardLayoutSectionHeaderRenderer}.
 *
 * @alpha
 */
export interface IDashboardLayoutSectionHeaderRenderProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout section.
     */
    section: IDashboardLayoutSectionFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;

    /**
     * Default renderer of the section header - can be used as a fallback for custom sectionHeaderRenderer.
     */
    DefaultSectionHeaderRenderer: IDashboardLayoutSectionHeaderRenderer<TWidget>;
}

/**
 * Dashboard layout section header renderer.
 * Represents a component for rendering the section header.
 *
 * @alpha
 */
export type IDashboardLayoutSectionHeaderRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutSectionHeaderRenderProps<TWidget> & TCustomProps,
) => JSX.Element | null;

/**
 * Default props provided to {@link IDashboardLayoutItemKeyGetter}
 *
 * @alpha
 */
export interface IDashboardLayoutItemKeyGetterProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout item.
     */
    item: IDashboardLayoutItemFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;
}

/**
 * Dashboard layout item key getter.
 * This callback is used to determine a unique key of the item.
 * By this callback, you can avoid unnecessary re-renders of the item components,
 * the returned unique key is passed to the React "key" property, when rendering columns.
 * By default, dashboard layout will use columnIndex as a unique key.
 *
 * @alpha
 */
export type IDashboardLayoutItemKeyGetter<TWidget = IDashboardWidget> = (
    props: IDashboardLayoutItemKeyGetterProps<TWidget>,
) => string;

/**
 * Default props provided to {@link IDashboardLayoutItemRenderer}
 *
 * @alpha
 */
export interface IDashboardLayoutItemRenderProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout item.
     */
    item: IDashboardLayoutItemFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;

    /**
     * Default renderer of the item - can be used as a fallback for custom columnRenderer.
     */
    DefaultItemRenderer: IDashboardLayoutItemRenderer<TWidget>;

    /**
     * Additional item css class name.
     */
    className?: string;

    /**
     * Minimum height of the item.
     */
    minHeight?: number;

    /**
     * Is hidden item? Use this to hide the item without remounting it.
     */
    isHidden?: boolean;

    /**
     * Widget rendered by widgetRenderer.
     */
    children: React.ReactNode;
}

/**
 * Dashboard layout item renderer.
 * Represents a component for rendering the item.
 *
 * @alpha
 */
export type IDashboardLayoutItemRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutItemRenderProps<TWidget> & TCustomProps,
) => JSX.Element;

/**
 * Default props provided to {@link IDashboardLayoutItemRenderer}
 *
 * @alpha
 */
export interface IDashboardLayoutWidgetRenderProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout item.
     */
    item: IDashboardLayoutItemFacade<TWidget>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;

    /**
     * React ref to content element.
     */
    contentRef?: React.RefObject<HTMLDivElement>;

    /**
     * Additional css class name of the content.
     */
    className?: string;

    /**
     * Content to render - widget, insight, or custom content.
     */
    children?: React.ReactNode;

    /**
     * Height of the content.
     */
    height?: React.CSSProperties["height"];

    /**
     * Minimum height of the content.
     */
    minHeight?: React.CSSProperties["minHeight"];

    /**
     * Allow vertical overflow?
     * (This basically sets overflowX to hidden and overflowY to auto)
     */
    allowOverflow?: boolean;

    /**
     * Was item size updated by layout sizing strategy?
     */
    isResizedByLayoutSizingStrategy?: boolean;

    /**
     * Enable debug mode? (In debug mode, sections & items are highlighted for better overview of the layout structure).
     */
    debug?: boolean;

    /**
     * Get dimensions of layout container element
     */
    getLayoutDimensions: () => DOMRect;

    /**
     * Default widget renderer - can be used as a fallback for custom widgetRenderer.
     */
    DefaultWidgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
}

/**
 * Dashboard layout content renderer.
 * Represents a component for rendering the item content.
 *
 * @alpha
 */
export type IDashboardLayoutWidgetRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutWidgetRenderProps<TWidget> & TCustomProps,
) => JSX.Element;

/**
 * Default props provided to {@link IDashboardLayoutGridRowRenderer}
 *
 * @alpha
 */
export interface IDashboardLayoutGridRowRenderProps<TWidget = IDashboardWidget> {
    /**
     * Items rendered in one row.
     */
    children: JSX.Element[];

    /**
     * Dashboard layout section.
     */
    section: IDashboardLayoutSectionFacade<TWidget>;

    /**
     * Layout items - keep in mind that these items are only items in the current grid row, not the entire section.
     */
    items: IDashboardLayoutItemFacade<TWidget>[];

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ScreenSize;

    /**
     * Dashboard render mode
     */
    renderMode: RenderMode;
}

/**
 * Dashboard layout grid row renderer.
 * Represents a component for rendering the real rendered row
 * with respect to the item sizing and the current screen size.
 *
 * @alpha
 */
export type IDashboardLayoutGridRowRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutGridRowRenderProps<TWidget> & TCustomProps,
) => JSX.Element;

/**
 * Dashboard layout render props.
 * Represents a customizable interface for rendering the layout.
 *
 * @alpha
 */
export interface IDashboardLayoutRenderProps<TWidget = IDashboardWidget> {
    /**
     * Dashboard layout definition to render.
     */
    layout: IDashboardLayout<TWidget>;

    /**
     * Callback to determine a unique key of the section.
     * Check {@link IDashboardLayoutSectionKeyGetter} for more details.
     */
    sectionKeyGetter?: IDashboardLayoutSectionKeyGetter<TWidget>;

    /**
     * Render props callback to customize section rendering.
     */
    sectionRenderer?: IDashboardLayoutSectionRenderer<TWidget>;

    /**
     * Render props callback to customize section header rendering.
     */
    sectionHeaderRenderer?: IDashboardLayoutSectionHeaderRenderer<TWidget>;

    /**
     * Render props callback to customize rendering of the real rendered rows
     * with respect to the items sizing and the current screen size.
     */
    gridRowRenderer?: IDashboardLayoutGridRowRenderer<TWidget>;

    /**
     * Callback to determine a unique key of the item.
     * Check {@link IDashboardLayoutItemKeyGetter} for more details.
     */
    itemKeyGetter?: IDashboardLayoutItemKeyGetter<TWidget>;

    /**
     * Render props callback to customize item rendering.
     */
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;

    /**
     * Render props callback to specify how to render the layout widget.
     */
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;

    /**
     * Additional css class name for the dashboard layout root element.
     */
    className?: string;

    /**
     * Callback called on mouse leave event.
     */
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;

    /**
     * Enable debug mode? (In debug mode, sections & items are highlighted for better overview of the layout structure).
     */
    debug?: boolean;

    /**
     * Checks if feature flag enableKDWidgetCustomHeight is enabled
     */
    enableCustomHeight?: boolean;

    /**
     * Dashboard render mode
     */
    renderMode?: RenderMode;
}

/**
 * Dashboard layout renderer.
 * Represents a component for rendering the layout.
 *
 * @alpha
 */
export type IDashboardLayoutRenderer<TWidget = IDashboardWidget, TCustomProps = object> = (
    renderProps: IDashboardLayoutRenderProps<TWidget> & TCustomProps,
) => JSX.Element;
