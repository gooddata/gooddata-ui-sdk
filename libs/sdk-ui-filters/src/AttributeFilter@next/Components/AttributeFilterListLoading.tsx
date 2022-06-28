// (C) 2022 GoodData Corporation
import React from "react";
import { LoadingMask } from "@gooddata/sdk-ui-kit";
import { IAttributeFilterListLoadingProps } from "./types";

export const AttributeFilterListLoading: React.VFC<IAttributeFilterListLoadingProps> = (props) => (
    <LoadingMask height={props.height} />
);
