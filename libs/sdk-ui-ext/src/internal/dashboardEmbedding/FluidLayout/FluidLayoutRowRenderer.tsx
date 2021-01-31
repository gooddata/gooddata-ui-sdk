// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IFluidLayoutRowRenderer } from "./interfaces";
import { Row } from "react-grid-system";

export const FluidLayoutRowRenderer: IFluidLayoutRowRenderer<any> = (props) => {
    const { children, className } = props;
    return <Row className={className}>{children}</Row>;
};
