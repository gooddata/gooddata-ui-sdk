// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/ban-types */

/**
 * Unique key to identify the attribute element - its uri, value or primaryKey.
 *
 * @public
 */
export type AttributeElementKey = string;

/**
 * @public
 */
export type Correlation = string;

/**
 * @public
 */
export type Unsubscribe = () => void;

/**
 * @public
 */
export type CallbackPayloadWithCorrelation<T = {}> = T & { correlation: Correlation };

/**
 * @public
 */
export type Callback<T> = (payload: T) => void;

/**
 * @public
 */
export type CallbackRegistration<T> = (cb: Callback<T>) => Unsubscribe;

/**
 * Represents the current status of the asynchronous operation.
 *
 * @public
 */
export type AsyncOperationStatus = "pending" | "loading" | "success" | "error" | "canceled";
