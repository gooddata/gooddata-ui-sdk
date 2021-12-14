// (C) 2021 GoodData Corporation

import { ShareStatus } from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export interface IShareStatusProps {
    shareStatus: ShareStatus;
    isUnderStrictControl: boolean;
}
