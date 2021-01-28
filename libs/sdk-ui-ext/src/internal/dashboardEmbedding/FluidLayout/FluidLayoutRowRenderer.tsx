// (C) 2007-2020 GoodData Corporation
import React from "react";
import { Row } from "react-grid-system";
import { IFluidLayoutRowRenderer } from "./interfaces";

export const FluidLayoutRowRenderer: IFluidLayoutRowRenderer<any> = (props) => {
    const { children, className } = props;
    return <Row className={className}>{children}</Row>;
};
