// (C) 2022 GoodData Corporation
import React from "react";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterElementsSelectLoadingProps {
    height: number;
}

/**
 * @internal
 */
export const AttributeFilterElementsSelectLoading: React.VFC<IAttributeFilterElementsSelectLoadingProps> = (
    props,
) => <LoadingMask height={props.height} />;
