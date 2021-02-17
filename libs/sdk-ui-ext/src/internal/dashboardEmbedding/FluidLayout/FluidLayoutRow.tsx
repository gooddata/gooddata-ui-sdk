// (C) 2007-2020 GoodData Corporation
import React from "react";
import {
    IFluidLayoutColumn,
    IFluidLayoutColumnFacade,
    IFluidLayoutRow,
    IFluidLayoutRowFacade,
    ResponsiveScreenType,
} from "@gooddata/sdk-backend-spi";
import {
    IFluidLayoutColumnKeyGetter,
    IFluidLayoutColumnRenderer,
    IFluidLayoutContentRenderer,
    IFluidLayoutRowKeyGetter,
    IFluidLayoutRowRenderer,
    IFluidLayoutRowHeaderRenderer,
} from "./interfaces";
import { FluidLayoutColumn } from "./FluidLayoutColumn";
import { FluidLayoutRowRenderer } from "./FluidLayoutRowRenderer";

/**
 * @alpha
 */
export interface IFluidLayoutRowProps<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> {
    row: TRowFacade;
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent, TRow, TRowFacade>;
    rowRenderer?: IFluidLayoutRowRenderer<TContent, TRow, TRowFacade>;
    rowHeaderRenderer?: IFluidLayoutRowHeaderRenderer<TContent, TRow, TRowFacade>;
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent, TColumn, TColumnFacade>;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TColumnFacade>;
    contentRenderer?: IFluidLayoutContentRenderer<TContent, TColumn, TColumnFacade>;
    screen: ResponsiveScreenType;
}

export function FluidLayoutRow<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
>(props: IFluidLayoutRowProps<TContent, TRow, TColumn, TRowFacade, TColumnFacade>): JSX.Element {
    const {
        row,
        rowRenderer = FluidLayoutRowRenderer,
        rowHeaderRenderer,
        columnKeyGetter = ({ column }) => column.index(),
        columnRenderer,
        contentRenderer,
        screen,
    } = props;
    const renderProps = { row, screen };

    const columns = row.columns().map((columnFacade: TColumnFacade) => {
        return (
            <FluidLayoutColumn
                key={columnKeyGetter({ column: columnFacade, screen })}
                column={columnFacade}
                columnRenderer={columnRenderer}
                contentRenderer={contentRenderer}
                screen={screen}
            />
        );
    });

    return rowRenderer({
        ...renderProps,
        DefaultRowRenderer: FluidLayoutRowRenderer,
        children: (
            <>
                {rowHeaderRenderer && rowHeaderRenderer({ row, screen })}
                {columns}
            </>
        ),
    });
}
