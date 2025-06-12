// (C) 2022 GoodData Corporation
import React from "react";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

/**
 * It display loading indicator when Attribute Filter is loading or searching elements.
 *
 * @beta
 */
export interface IAttributeFilterElementsSelectLoadingProps {
    /**
     * height of component
     */
    height: number;
}

/**
 * Component displays loading indicator.
 *
 * @beta
 */
export const AttributeFilterElementsSelectLoading: React.VFC<IAttributeFilterElementsSelectLoadingProps> = (
    props,
) => <LoadingMask height={props.height} />;
