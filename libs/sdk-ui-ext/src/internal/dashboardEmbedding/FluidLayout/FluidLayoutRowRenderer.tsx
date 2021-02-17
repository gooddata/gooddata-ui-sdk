// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IFluidLayoutRowRenderer } from "./interfaces";
import { Row } from "react-grid-system";
import { IFluidLayoutRow, IFluidLayoutRowFacade } from "@gooddata/sdk-backend-spi";

export const FluidLayoutRowRenderer: IFluidLayoutRowRenderer<
    unknown,
    IFluidLayoutRow<unknown>,
    IFluidLayoutRowFacade<unknown, IFluidLayoutRow<unknown>>
> = (props) => {
    const { children, className } = props;
    return <Row className={className}>{children}</Row>;
};
