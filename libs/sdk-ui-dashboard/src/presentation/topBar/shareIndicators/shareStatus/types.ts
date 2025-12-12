// (C) 2021-2022 GoodData Corporation

import { type ShareStatus } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export interface IShareStatusProps {
    shareStatus: ShareStatus;
    isUnderStrictControl: boolean;
}
