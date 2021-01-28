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
        rowRenderer: RowRenderer = FluidLayoutRowRenderer,
        rowHeaderRenderer: RowHeaderRenderer,
        columnKeyGetter = ({ column }) => column.index(),
        columnRenderer,
        contentRenderer,
        screen,
    } = props;
    const renderProps = { row, screen };

    const columns = row.columns().map((column) => {
        return (
            <FluidLayoutColumn
                key={columnKeyGetter({ column, screen })}
                column={column}
                columnRenderer={columnRenderer}
                contentRenderer={contentRenderer}
                screen={screen}
            />
        );
    });

    return (
        <RowRenderer {...renderProps} DefaultRenderer={FluidLayoutRowRenderer}>
            {RowHeaderRenderer && <RowHeaderRenderer row={row} screen={screen} />}
            {columns}
        </RowRenderer>
    );
}
