// (C) 2007-2020 GoodData Corporation
import React from "react";
import { ResponsiveScreenType, IFluidLayoutRowMethods } from "@gooddata/sdk-backend-spi";
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
export interface IFluidLayoutRowProps<TContent> {
    row: IFluidLayoutRowMethods<TContent>;
    rowKeyGetter?: IFluidLayoutRowKeyGetter<TContent>;
    rowRenderer?: IFluidLayoutRowRenderer<TContent>;
    rowHeaderRenderer?: IFluidLayoutRowHeaderRenderer<TContent>;
    columnKeyGetter?: IFluidLayoutColumnKeyGetter<TContent>;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent>;
    contentRenderer?: IFluidLayoutContentRenderer<TContent>;
    screen: ResponsiveScreenType;
}

export function FluidLayoutRow<TContent>(props: IFluidLayoutRowProps<TContent>): JSX.Element {
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

    const columns = row.columns().map((columnFacade) => {
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
