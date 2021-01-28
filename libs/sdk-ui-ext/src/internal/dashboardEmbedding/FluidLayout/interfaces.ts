// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutRowMethods,
    IFluidLayoutColumnMethods,
    ResponsiveScreenType,
} from "@gooddata/sdk-backend-spi";

/**
 * Default props provided to {@link IFluidLayoutRowKeyGetter}.
 *
 * @alpha
 */
export type IFluidLayoutRowKeyGetterProps<TContent> = {
    /**
     * Fluid layout row.
     */
    row: IFluidLayoutRowMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;
};

/**
 * Fluid layout row key getter.
 * This callback is used to determine a unique key of the row.
 * By this callback, you can avoid unnecessary re-renders of the row components,
 * the returned unique key is passed to the React "key" property, when rendering rows.
 * By default, fluid layout will use rowIndex as a unique key.
 *
 * @alpha
 */
export type IFluidLayoutRowKeyGetter<TContent> = (props: IFluidLayoutRowKeyGetterProps<TContent>) => string;

/**
 * Default props provided to {@link IFluidLayoutRowRenderer}.
 *
 * @alpha
 */
export type IFluidLayoutRowRenderProps<TContent> = {
    /**
     * Fluid layout row.
     */
    row: IFluidLayoutRowMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;

    /**
     * Default renderer of the row - can be used as a fallback for custom rowRenderer.
     */
    DefaultRenderer: IFluidLayoutRowRenderer<TContent>;

    /**
     * Columns rendered by columnRenderer.
     */
    children?: React.ReactNode;

    /**
     * Additional row css class name.
     */
    className?: string;
};

/**
 * Fluid layout row renderer.
 * Represents a component for rendering the row.
 *
 * @alpha
 */
export type IFluidLayoutRowRenderer<TContent, TCustomProps = object> = React.ComponentType<
    IFluidLayoutRowRenderProps<TContent> & TCustomProps
>;

/**
 * Default props provided to {@link IFluidLayoutRowHeaderRenderer}.
 *
 * @alpha
 */
export type IFluidLayoutRowHeaderRenderProps<TContent> = {
    /**
     * Fluid layout row.
     */
    row: IFluidLayoutRowMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;
};

/**
 * Fluid layout row heder renderer.
 * Represents a component for rendering the row header.
 *
 * @alpha
 */
export type IFluidLayoutRowHeaderRenderer<TContent, TCustomProps = object> = React.ComponentType<
    IFluidLayoutRowHeaderRenderProps<TContent> & TCustomProps
>;

/**
 * Default props provided to {@link IFluidLayoutColumnKeyGetter}
 *
 * @alpha
 */
export type IFluidLayoutColumnKeyGetterProps<TContent> = {
    /**
     * Fluid layout column.
     */
    column: IFluidLayoutColumnMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;
};

/**
 * Fluid layout column key getter.
 * This callback is used to determine a unique key of the column.
 * By this callback, you can avoid unnecessary re-renders of the column components,
 * the returned unique key is passed to the React "key" property, when rendering columns.
 * By default, fluid layout will use columnIndex as a unique key.
 *
 * @alpha
 */
export type IFluidLayoutColumnKeyGetter<TContent> = (
    props: IFluidLayoutColumnKeyGetterProps<TContent>,
) => string;

/**
 * Default props provided to {@link IFluidLayoutColumnRenderer}
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderProps<TContent> = {
    /**
     * Fluid layout column.
     */
    column: IFluidLayoutColumnMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;

    /**
     * Default renderer of the column - can be used as a fallback for custom columnRenderer.
     */
    DefaultRenderer: IFluidLayoutColumnRenderer<TContent>;

    /**
     * Additional column css class name.
     */
    className?: string;

    /**
     * Minimum height of the column.
     */
    minHeight?: number;

    /**
     * Column content rendered by contentRenderer.
     */
    children?: React.ReactNode;
};

/**
 * Fluid layout column renderer.
 * Represents a component for rendering the column.
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderer<TContent, TCustomProps = object> = React.ComponentType<
    IFluidLayoutColumnRenderProps<TContent> & TCustomProps
>;

/**
 * Default props provided to {@link IFluidLayoutContentRenderer}
 *
 * @alpha
 */
export type IFluidLayoutContentRenderProps<TContent> = {
    /**
     * Fluid layout column.
     */
    column: IFluidLayoutColumnMethods<TContent>;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;
};

/**
 * Fluid layout content renderer.
 * Represents a component for rendering the column content.
 *
 * @alpha
 */
export type IFluidLayoutContentRenderer<TContent, TCustomProps = object> = React.ComponentType<
    IFluidLayoutContentRenderProps<TContent> & TCustomProps
>;

/**
 * Fluid layout renderer.
 * Represents a component for rendering the layout.
 *
 * @alpha
 */
export type IFluidLayoutRenderer<TContent> = {
    /**
     * Fluid layout definition to render.
     */
    layout: IFluidLayout<TContent>;

    /**
     * Callback to determine a unique key of the row.
     * Check {@link IFluidLayoutRowKeyGetter} for more details.
     */
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent>;

    /**
     * Render props callback to customize row rendering.
     */
    rowRenderer?: IFluidLayoutRowRenderer<TContent>;

    /**
     * Render props callback to customize row header rendering.
     */
    rowHeaderRenderer?: IFluidLayoutRowHeaderRenderer<TContent>;

    /**
     * Callback to determine a unique key of the column.
     * Check {@link IFluidLayoutColumnKeyGetter} for more details.
     */
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent>;

    /**
     * Render props callback to customize column rendering.
     */
    columnRenderer?: IFluidLayoutColumnRenderer<TContent>;

    /**
     * Render props callback to specify how to render the content of the layout.
     */
    contentRenderer: IFluidLayoutContentRenderer<TContent>;

    /**
     * Additional css class name for the root element.
     */
    className?: string;

    /**
     * Additional css class name for the fluid container element.
     */
    containerClassName?: string;

    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
};
