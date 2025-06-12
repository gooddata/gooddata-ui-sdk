// (C) 2021-2022 GoodData Corporation

import { ShareStatus } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IShareStatusProps {
    shareStatus: ShareStatus;
    isUnderStrictControl: boolean;
}
