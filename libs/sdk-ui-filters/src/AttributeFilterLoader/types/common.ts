// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/ban-types */
import { IAttributeElement } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export type Correlation = string;

/**
 * @alpha
 */
export type Unsubscribe = () => void;

/**
 * @alpha
 */

export type CallbackPayload<T extends object = {}> = T & { correlation?: Correlation };

/**
 * @alpha
 */
export type Callback<T extends object = {}> = (payload: CallbackPayload<T>) => void;

/**
 * @alpha
 */
export type CallbackRegistration<T extends object = {}> = (cb: Callback<T>) => Unsubscribe;

/**
 * @alpha
 */
export interface IElementsLoadResult {
    readonly attributeElements: IAttributeElement[];
    readonly limit: number;
    readonly offset: number;
    readonly totalCount: number;
}

/**
 * @alpha
 */
export interface ILoadRangeOptions {
    readonly limit: number;
    readonly offset: number;
}
