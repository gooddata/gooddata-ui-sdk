// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutColumnFacade,
    IFluidLayoutFacade,
    IFluidLayoutRow,
    IFluidLayoutRowFacade,
    ResponsiveScreenType,
} from "@gooddata/sdk-backend-spi";

/**
 * Default props provided to {@link IFluidLayoutRowKeyGetter}.
 *
 * @alpha
 */
export type IFluidLayoutRowKeyGetterProps<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> = {
    /**
     * Fluid layout row.
     */
    row: TRowFacade;

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
export type IFluidLayoutRowKeyGetter<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> = (props: IFluidLayoutRowKeyGetterProps<TContent, TRow, TRowFacade>) => string;

/**
 * Default props provided to {@link IFluidLayoutRowRenderer}.
 *
 * @alpha
 */
export type IFluidLayoutRowRenderProps<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> = {
    /**
     * Fluid layout row.
     */
    row: TRowFacade;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;

    /**
     * Default renderer of the row - can be used as a fallback for custom rowRenderer.
     */
    DefaultRowRenderer: IFluidLayoutRowRenderer<TContent, TRow, TRowFacade>;

    /**
     * Columns rendered by columnRenderer.
     */
    children: React.ReactNode;

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
export type IFluidLayoutRowRenderer<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TCustomProps = object
> = (renderProps: IFluidLayoutRowRenderProps<TContent, TRow, TRowFacade> & TCustomProps) => JSX.Element;

/**
 * Default props provided to {@link IFluidLayoutRowHeaderRenderer}.
 *
 * @alpha
 */
export type IFluidLayoutRowHeaderRenderProps<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> = {
    /**
     * Fluid layout row.
     */
    row: TRowFacade;

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
export type IFluidLayoutRowHeaderRenderer<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TCustomProps = object
> = (renderProps: IFluidLayoutRowHeaderRenderProps<TContent, TRow, TRowFacade> & TCustomProps) => JSX.Element;

/**
 * Default props provided to {@link IFluidLayoutColumnKeyGetter}
 *
 * @alpha
 */
export type IFluidLayoutColumnKeyGetterProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = {
    /**
     * Fluid layout column.
     */
    column: TColumnFacade;

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
export type IFluidLayoutColumnKeyGetter<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = (props: IFluidLayoutColumnKeyGetterProps<TContent, TColumn, TColumnFacade>) => string;

/**
 * Default props provided to {@link IFluidLayoutColumnRenderer}
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = {
    /**
     * Fluid layout column.
     */
    column: TColumnFacade;

    /**
     * Current screen type with respect to the set breakpoints.
     */
    screen: ResponsiveScreenType;

    /**
     * Default renderer of the column - can be used as a fallback for custom columnRenderer.
     */
    DefaultColumnRenderer: IFluidLayoutColumnRenderer<TContent, TColumn, TColumnFacade>;

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
    children: React.ReactNode;
};

/**
 * Fluid layout column renderer.
 * Represents a component for rendering the column.
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderer<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TCustomProps = object
> = (
    renderProps: IFluidLayoutColumnRenderProps<TContent, TColumn, TColumnFacade> & TCustomProps,
) => JSX.Element;

/**
 * Default props provided to {@link IFluidLayoutContentRenderer}
 *
 * @alpha
 */
export type IFluidLayoutContentRenderProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = {
    /**
     * Fluid layout column.
     */
    column: TColumnFacade;

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
export type IFluidLayoutContentRenderer<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TCustomProps = object
> = (
    renderProps: IFluidLayoutContentRenderProps<TContent, TColumn, TColumnFacade> & TCustomProps,
) => JSX.Element;

/**
 * Fluid layout renderer.
 * Represents a component for rendering the layout.
 *
 * @alpha
 */
export type IFluidLayoutRenderer<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TLayout extends IFluidLayout<TContent>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> = {
    /**
     * Fluid layout definition to render.
     */
    layout: TLayout;

    /**
     * Layout facade constructor (e.g. to support IDashboardViewLayoutFacade).
     */
    layoutFacadeConstructor?: (layout: TLayout) => TLayoutFacade;

    /**
     * Callback to determine a unique key of the row.
     * Check {@link IFluidLayoutRowKeyGetter} for more details.
     */
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent, TRow, TRowFacade>;

    /**
     * Render props callback to customize row rendering.
     */
    rowRenderer?: IFluidLayoutRowRenderer<TContent, TRow, TRowFacade>;

    /**
     * Render props callback to customize row header rendering.
     */
    rowHeaderRenderer?: IFluidLayoutRowHeaderRenderer<TContent, TRow, TRowFacade>;

    /**
     * Callback to determine a unique key of the column.
     * Check {@link IFluidLayoutColumnKeyGetter} for more details.
     */
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent, TColumn, TColumnFacade>;

    /**
     * Render props callback to customize column rendering.
     */
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TColumnFacade>;

    /**
     * Render props callback to specify how to render the content of the layout.
     */
    contentRenderer: IFluidLayoutContentRenderer<TContent, TColumn, TColumnFacade>;

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
