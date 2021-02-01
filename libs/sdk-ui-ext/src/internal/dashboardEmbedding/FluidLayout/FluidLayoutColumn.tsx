// (C) 2007-2020 GoodData Corporation

import { FluidLayoutColumnRenderer } from "./FluidLayoutColumnRenderer";
import { ResponsiveScreenType, IFluidLayoutColumnMethods } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutColumnRenderer, IFluidLayoutContentRenderer } from "./interfaces";

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
    const { column, columnRenderer = FluidLayoutColumnRenderer, contentRenderer, screen } = props;
    const renderProps = { column, screen };

    return columnRenderer({
        ...renderProps,
        DefaultColumnRenderer: FluidLayoutColumnRenderer,
        children: contentRenderer(renderProps),
    });
}
