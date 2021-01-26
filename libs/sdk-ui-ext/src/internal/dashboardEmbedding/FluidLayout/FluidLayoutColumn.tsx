// (C) 2007-2020 GoodData Corporation
import React from "react";
import { ResponsiveScreenType, IFluidLayoutColumnMethods } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutColumnRenderer, IFluidLayoutContentRenderer } from "./interfaces";
import { FluidLayoutColumnRenderer } from "./FluidLayoutColumnRenderer";

/**
 * @alpha
 */
export interface IFluidLayoutColumnProps<TContent> {
    column: IFluidLayoutColumnMethods<TContent>;
    screen: ResponsiveScreenType;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent>;
    contentRenderer: IFluidLayoutContentRenderer<TContent>;
}

export function FluidLayoutColumn<TContent>(props: IFluidLayoutColumnProps<TContent>): JSX.Element {
    const {
        column,
        columnRenderer: ColumnRenderer = FluidLayoutColumnRenderer,
        contentRenderer: ContentRenderer,
        screen,
    } = props;

    const renderProps = { column, screen };

    return (
        <ColumnRenderer {...renderProps} DefaultRenderer={FluidLayoutColumnRenderer}>
            <ContentRenderer {...renderProps} />
        </ColumnRenderer>
    );
}
