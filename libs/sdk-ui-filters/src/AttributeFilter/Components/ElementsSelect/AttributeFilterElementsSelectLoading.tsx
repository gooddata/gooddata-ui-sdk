// (C) 2022-2025 GoodData Corporation

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
export function AttributeFilterElementsSelectLoading({ height }: IAttributeFilterElementsSelectLoadingProps) {
    return <LoadingMask height={height} />;
}
