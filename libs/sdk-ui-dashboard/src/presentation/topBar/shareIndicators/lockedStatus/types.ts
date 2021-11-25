// (C) 2021 GoodData Corporation

import { ITheme } from "@gooddata/sdk-backend-spi";
/**
 * @alpha
 */
export interface ILockedStatusProps {
    isLocked: boolean;
    theme?: ITheme;
}
