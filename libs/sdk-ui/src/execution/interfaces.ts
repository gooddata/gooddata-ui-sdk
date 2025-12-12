// (C) 2021-2025 GoodData Corporation
import { type ComponentType } from "react";

import { type GoodDataSdkError } from "../base/index.js";

/**
 * Properties of the error component provided to Execute or RawExecute components
 * @public
 */
export interface IExecuteErrorComponentProps {
    /**
     * Original error
     */
    error: GoodDataSdkError;
}

/**
 * Represents a loading component provided to Execute or RawExecute components
 * @public
 */
export type IExecuteLoadingComponent = ComponentType;

/**
 * Represents an error component provided to Execute or RawExecute components
 * @public
 */
export type IExecuteErrorComponent = ComponentType<IExecuteErrorComponentProps>;
