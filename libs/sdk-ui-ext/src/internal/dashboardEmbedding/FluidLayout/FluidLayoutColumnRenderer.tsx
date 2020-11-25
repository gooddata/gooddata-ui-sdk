// (C) 2007-2020 GoodData Corporation
import React from "react";
import { Col } from "react-grid-system";
import { IFluidLayoutColumn, IFluidLayoutRow } from "@gooddata/sdk-backend-spi";
import { IFluidLayoutColumnRenderer } from "./interfaces";

export const FluidLayoutColumnRenderer: IFluidLayoutColumnRenderer<
    any,
    IFluidLayoutColumn<any>,
    IFluidLayoutRow<any, IFluidLayoutColumn<any>>
> = (props) => {
    const {
        column,
        children,
        columnIndex: _columnIndex,
        rowIndex: _rowIndex,
        row: _row,
        screen: _screen,
        ...colProps
    } = props;
    const { size } = column;

    return (
        <Col
            xl={size?.xl?.widthAsGridColumnsCount}
            lg={size?.lg?.widthAsGridColumnsCount}
            md={size?.md?.widthAsGridColumnsCount}
            sm={size?.sm?.widthAsGridColumnsCount}
            xs={size?.xs?.widthAsGridColumnsCount}
            {...colProps}
        >
            {children}
        </Col>
    );
};
