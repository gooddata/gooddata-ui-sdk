// (C) 2007-2020 GoodData Corporation
import React, { useMemo } from "react";
import { IFluidLayoutColumnRenderer } from "./interfaces";
import { Col } from "react-grid-system";
import { IFluidLayoutColumn, IFluidLayoutColumnFacade } from "@gooddata/sdk-backend-spi";

export const FluidLayoutColumnRenderer: IFluidLayoutColumnRenderer<
    unknown,
    IFluidLayoutColumn<unknown>,
    IFluidLayoutColumnFacade<unknown, IFluidLayoutColumn<unknown>>
> = (props) => {
    const { column, children, className, minHeight } = props;
    const size = column.size();
    const style = useMemo(() => ({ minHeight }), [minHeight]);

    return (
        <Col
            xl={size?.xl?.widthAsGridColumnsCount}
            lg={size?.lg?.widthAsGridColumnsCount}
            md={size?.md?.widthAsGridColumnsCount}
            sm={size?.sm?.widthAsGridColumnsCount}
            xs={size?.xs?.widthAsGridColumnsCount}
            className={className}
            style={style}
        >
            {children}
        </Col>
    );
};
