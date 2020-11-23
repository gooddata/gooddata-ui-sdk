// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IFluidLayoutColumn, IFluidLayoutRow, ResponsiveScreenType } from "@gooddata/sdk-backend-spi";
import {
    IFluidLayoutColumnKeyGetter,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutRowRenderer,
} from "./interfaces";
import { FluidLayoutColumn } from "./FluidLayoutColumn";
import { FluidLayoutRowRenderer } from "./FluidLayoutRowRenderer";

export interface IFluidLayoutRowProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
> {
    row: TRow;
    rowIndex: number;
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent, TColumn, TRow>;
    rowRenderer?: IFluidLayoutRowRenderer<TContent, TColumn, TRow>;
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent, TColumn, TRow>;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TRow>;
    contentRenderer?: IFluidLayoutContentRenderer<TContent, TColumn, TRow>;
    screen: ResponsiveScreenType;
}

export function FluidLayoutRow<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent, TColumn>
>(props: IFluidLayoutRowProps<TContent, TColumn, TRow>): React.ReactElement {
    const {
        row,
        rowIndex,
        rowRenderer: RowRenderer = FluidLayoutRowRenderer,
        columnKeyGetter = ({ columnIndex }) => columnIndex,
        columnRenderer,
        contentRenderer,
        screen,
    } = props;
    const renderProps = { row, rowIndex, screen };

    const columns = row.columns.map((column, columnIndex: number) => {
        return (
            <FluidLayoutColumn
                key={columnKeyGetter({ column, columnIndex, row, rowIndex, screen })}
                row={row}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                column={column}
                columnRenderer={columnRenderer}
                contentRenderer={contentRenderer}
                screen={screen}
            />
        );
    });

    return <RowRenderer {...renderProps}>{columns}</RowRenderer>;
}
