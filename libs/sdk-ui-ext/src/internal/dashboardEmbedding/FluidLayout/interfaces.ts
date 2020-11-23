// (C) 2019-2020 GoodData Corporation
import { Col, ColProps, Row, RowProps } from "react-grid-system";
import { IFluidLayoutColumn, IFluidLayoutRow, ResponsiveScreenType } from "@gooddata/sdk-backend-spi";

/**
 * Default props provided to a fluid layout row components and component callbacks.
 *
 * @alpha
 */
export type IFluidLayoutRowRenderProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> = {
    /**
     * Fluid layout row.
     */
    row: TRow;

    /**
     * Fluid layout row index.
     */
    rowIndex: number;

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
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> = (props: IFluidLayoutRowRenderProps<TContent, TColumn, TRow>) => string;

/**
 * Fluid layout row renderer.
 * Represents a component for rendering the row.
 *
 * @alpha
 */
export type IFluidLayoutRowRenderer<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>,
    TCustomProps = object
> = React.ComponentType<
    IFluidLayoutRowRenderProps<TContent, TColumn, TRow> &
        RowProps & { ref?: React.RefObject<Row> } & TCustomProps
>;

/**
 * Default props provided to a fluid layout column components and component callbacks.
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> = {
    /**
     * Fluid layout row.
     */
    row: TRow;

    /**
     * Fluid layout row index.
     */
    rowIndex: number;

    /**
     * Fluid layout column.
     */
    column: TColumn;

    /**
     * Fluid layout column index.
     */
    columnIndex: number;

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
    TRow extends IFluidLayoutRow<TContent, TColumn>
> = (props: IFluidLayoutColumnRenderProps<TContent, TColumn, TRow>) => string;

/**
 * Fluid layout column renderer.
 * Represents a component for rendering the column.
 *
 * @alpha
 */
export type IFluidLayoutColumnRenderer<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>,
    TCustomProps = object
> = React.ComponentType<
    IFluidLayoutColumnRenderProps<TContent, TColumn, TRow> &
        ColProps & { ref?: React.RefObject<Col> } & TCustomProps
>;

/**
 * Fluid layout content renderer.
 * Represents a component for rendering the column content.
 *
 * @alpha
 */
export type IFluidLayoutContentRenderer<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>,
    TCustomProps = object
> = React.ComponentType<IFluidLayoutColumnRenderProps<TContent, TColumn, TRow> & TCustomProps>;
