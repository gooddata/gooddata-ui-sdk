// (C) 2007-2020 GoodData Corporation

import { FluidLayoutColumnRenderer } from "./FluidLayoutColumnRenderer";
import {
    ResponsiveScreenType,
    IFluidLayoutColumnFacade,
    IFluidLayoutColumn,
} from "@gooddata/sdk-backend-spi";
import { IFluidLayoutColumnRenderer, IFluidLayoutContentRenderer } from "./interfaces";

/**
 * @alpha
 */
export interface IFluidLayoutColumnProps<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> {
    column: TColumnFacade;
    screen: ResponsiveScreenType;
    columnRenderer?: IFluidLayoutColumnRenderer<TContent, TColumn, TColumnFacade>;
    contentRenderer: IFluidLayoutContentRenderer<TContent, TColumn, TColumnFacade>;
}

export function FluidLayoutColumn<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
>(props: IFluidLayoutColumnProps<TContent, TColumn, TColumnFacade>): JSX.Element {
    const { column, columnRenderer = FluidLayoutColumnRenderer, contentRenderer, screen } = props;
    const renderProps = { column, screen };

    return columnRenderer({
        ...renderProps,
        DefaultColumnRenderer: FluidLayoutColumnRenderer,
        children: contentRenderer(renderProps),
    });
}
