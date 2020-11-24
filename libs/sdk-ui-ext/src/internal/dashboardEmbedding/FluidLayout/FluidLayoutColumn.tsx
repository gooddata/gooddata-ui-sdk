// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IFluidLayoutColumn, IFluidLayoutRow, ResponsiveScreenType } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutColumnRenderer, IFluidLayoutContentRenderer } from "./interfaces";
import { FluidLayoutColumnRenderer } from "./FluidLayoutColumnRenderer";

export interface IFluidLayoutColumnProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> {
    row: TRow;
    rowIndex: number;
    column: TColumn;
    columnIndex: number;
    screen: ResponsiveScreenType;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TRow>;
    contentRenderer: IFluidLayoutContentRenderer<TContent, TColumn, TRow>;
}

export function FluidLayoutColumn<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
>(props: IFluidLayoutColumnProps<TContent, TColumn, TRow>): React.ReactElement {
    const {
        row,
        rowIndex,
        column,
        columnIndex,
        columnRenderer: ColumnRenderer = FluidLayoutColumnRenderer,
        contentRenderer: ContentRenderer,
        screen,
    } = props;

    const renderProps = { row, rowIndex, column, columnIndex, screen };

    return (
        <ColumnRenderer {...renderProps}>
            <ContentRenderer {...renderProps} />
        </ColumnRenderer>
    );
}
